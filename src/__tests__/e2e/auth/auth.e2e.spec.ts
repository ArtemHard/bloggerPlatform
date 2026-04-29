import supertest from 'supertest';
import express from 'express';
import { setupApp } from '../../../setup-app';
import { HttpStatus } from '../../../core/types/http-statuses';
import { AUTH_PATH } from '../../../core/paths/paths';
import { CreateUserDto } from '../../../domain/users/types/create-user.dto';
import { runDB, stopDb } from '../../../db/mongo.db';
import { SETTINGS } from '../../../core/settings/settings';
import { clearDb } from '../../../core/utils/clear-db';
import { container } from '../../../ioc/ioc.container';
import { TYPES } from '../../../ioc/ioc.types';
import { IUsersRepository } from '../../../domain/repositories/types/users.repository.interface';

const usersRepository = container.get<IUsersRepository>(TYPES.UsersRepository);

jest.mock('nodemailer', () => {
  const mockTransporter = {
    sendMail: jest.fn().mockResolvedValue({ messageId: '12345' }),
  };

  return {
    createTransport: jest.fn(() => mockTransporter),
  };
});

describe('Auth API', () => {
  const app = express();
  setupApp(app);

  const testLoginData = {
    loginOrEmail: 'lg-697232',
    password: 'qwerty1',
  };

  const wrongLoginData = {
    loginOrEmail: 'wronglogin',
    password: 'qwerty1',
  };

  const wrongPasswordData = {
    loginOrEmail: 'lg-697232',
    password: 'wrongpassword',
  };

  const registrationData: CreateUserDto = {
    login: 'testuser',
    email: 'testuser@example.com',
    password: 'password123',
  };

  
 beforeAll(async () => {
  await runDB(SETTINGS.MONGO_URL);
}, 15000);

beforeEach(async () => {
  await clearDb(app);
}, 10000);

  afterAll(async () => {
    await stopDb();
  }, 10000);

  describe('POST /auth/login', () => {
    it('should sign in user; status 200', async () => {
      await supertest(app)
        .post('/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'lg-697232',
          email: 'lg-697232@example.com',
          password: 'qwerty1',
        })
        .expect(HttpStatus.Created);

      const loginResponse = await supertest(app)
        .post(`${AUTH_PATH}/login`)
        .send(testLoginData);
      expect(loginResponse.status).toBe(HttpStatus.Ok);

      expect(loginResponse.body).toHaveProperty('accessToken');
      expect(typeof loginResponse.body.accessToken).toBe('string');
      expect(loginResponse.body.accessToken).not.toHaveLength(0);
    });

    it('should return error if passed wrong login; status 401', async () => {
      await supertest(app)
        .post('/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'lg-697232',
          email: 'lg-697232@example.com',
          password: 'qwerty1',
        })
        .expect(HttpStatus.Created);

      // Try to login with wrong login
      await supertest(app)
        .post(`${AUTH_PATH}/login`)
        .send(wrongLoginData)
        .expect(HttpStatus.Unauthorized);
    });

    it('should return error if passed wrong password; status 401', async () => {
      // Create a user first
      await supertest(app)
        .post('/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'lg-697232',
          email: 'lg-697232@example.com',
          password: 'qwerty1',
        })
        .expect(HttpStatus.Created);

      // Try to login with wrong password
      await supertest(app)
        .post(`${AUTH_PATH}/login`)
        .send(wrongPasswordData)
        .expect(HttpStatus.Unauthorized);
    });

    it('should return error if user does not exist; status 401', async () => {
      // Try to login with non-existent user
      await supertest(app)
        .post(`${AUTH_PATH}/login`)
        .send({
          loginOrEmail: 'nonexistent',
          password: 'password123',
        })
        .expect(HttpStatus.Unauthorized);
    });

    it('should return error for invalid input; status 400', async () => {
      // Test with missing loginOrEmail
      await supertest(app)
        .post(`${AUTH_PATH}/login`)
        .send({
          password: 'qwerty1',
        })
        .expect(HttpStatus.BadRequest);

      // Test with missing password
      await supertest(app)
        .post(`${AUTH_PATH}/login`)
        .send({
          loginOrEmail: 'lg-697232',
        })
        .expect(HttpStatus.BadRequest);

      // Test with empty strings
      await supertest(app)
        .post(`${AUTH_PATH}/login`)
        .send({
          loginOrEmail: '',
          password: '',
        })
        .expect(HttpStatus.BadRequest);
    });
  });

  describe('GET /auth/me', () => {
    it('should return 401 without Authorization header', async () => {
      await supertest(app)
        .get(`${AUTH_PATH}/me`)
        .expect(HttpStatus.Unauthorized);
    });

    it('should return 401 with wrong Authorization header format', async () => {
      await supertest(app)
        .get(`${AUTH_PATH}/me`)
        .set('Authorization', 'Basic wrongToken')
        .expect(HttpStatus.Unauthorized);
    });

    it('should return 401 with invalid token', async () => {
      await supertest(app)
        .get(`${AUTH_PATH}/me`)
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(HttpStatus.Unauthorized);
    });

    it('should return user info with valid token; status 200', async () => {
      // First, get a valid token
      await supertest(app)
        .post('/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'lg-697232',
          email: 'lg-697232@example.com',
          password: 'qwerty1',
        })
        .expect(HttpStatus.Created);

      const loginResponse = await supertest(app)
        .post(`${AUTH_PATH}/login`)
        .send(testLoginData)
        .expect(HttpStatus.Ok);

      const token = loginResponse.body.accessToken;

      const meResponse = await supertest(app)
        .get(`${AUTH_PATH}/me`)
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.Ok);

      expect(meResponse.body).toEqual({
        userId: expect.any(String),
        login: 'lg-697232',
        email: 'lg-697232@example.com',
      });
    });

    it('should sign in user with login lg-175382; status 200', async () => {
      const userData = {
        login: 'lg-175382',
        email: 'lg-175382@example.com',
        password: 'qwerty1',
      };

      const loginData = {
        loginOrEmail: 'lg-175382',
        password: 'qwerty1',
      };

      // Создаём пользователя
      await supertest(app)
        .post('/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send(userData)
        .expect(HttpStatus.Created);

      // Пробуем залогиниться
      const response = await supertest(app)
        .post(`${AUTH_PATH}/login`)
        .send(loginData)
        .expect(HttpStatus.Ok);

      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
      expect(response.body.accessToken).toBeTruthy();
    });
  });

  describe('POST /auth/registration', () => {
    it('should register a new user with valid data; status 204', async () => {
      await supertest(app)
        .post(`${AUTH_PATH}/registration`)
        .send(registrationData)
        .expect(HttpStatus.NoContent);
    });

    it('should return 400 if email is invalid', async () => {
      const invalidEmailData = { ...registrationData, email: 'invalid-email' };

      const response = await supertest(app)
        .post(`${AUTH_PATH}/registration`)
        .send(invalidEmailData)
        .expect(HttpStatus.BadRequest);

      expect(response.body.errorsMessages).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: expect.any(String),
        }),
      );
    });

    it('should return 400 if login is too short', async () => {
      const shortLoginData = { ...registrationData, login: 'ab' };

      const response = await supertest(app)
        .post(`${AUTH_PATH}/registration`)
        .send(shortLoginData)
        .expect(HttpStatus.BadRequest);

      expect(response.body.errorsMessages).toContainEqual(
        expect.objectContaining({
          field: 'login',
          message: expect.any(String),
        }),
      );
    });

    it('should return 400 if password is too short', async () => {
      const shortPasswordData = { ...registrationData, password: '12345' };

      const response = await supertest(app)
        .post(`${AUTH_PATH}/registration`)
        .send(shortPasswordData)
        .expect(HttpStatus.BadRequest);

      expect(response.body.errorsMessages).toContainEqual(
        expect.objectContaining({
          field: 'password',
          message: expect.any(String),
        }),
      );
    });

    it('should return 400 if user with same email already exists', async () => {
      // First, register a user
      await supertest(app)
        .post(`${AUTH_PATH}/registration`)
        .send(registrationData)
        .expect(HttpStatus.NoContent);

      // Try to register with the same email
      const response = await supertest(app)
        .post(`${AUTH_PATH}/registration`)
        .send(registrationData)
        .expect(HttpStatus.BadRequest);

      expect(response.body.errorsMessages).toContainEqual(
        expect.objectContaining({
          field: 'loginOrEmail',
          message: expect.any(String),
        }),
      );
    });

    it('should return 400 if user with same login already exists', async () => {
      // First, register a user
      await supertest(app)
        .post(`${AUTH_PATH}/registration`)
        .send(registrationData)
        .expect(HttpStatus.NoContent);

      // Try to register with the same login
      const differentEmailData = {
        ...registrationData,
        email: 'different@example.com',
      };

      const response = await supertest(app)
        .post(`${AUTH_PATH}/registration`)
        .send(differentEmailData)
        .expect(HttpStatus.BadRequest);

      expect(response.body.errorsMessages).toContainEqual(
        expect.objectContaining({
          field: 'loginOrEmail',
          message: expect.any(String),
        }),
      );
    });
  });

  describe('POST /auth/registration-confirmation', () => {
    it('should confirm registration with valid code; status 204', async () => {
      // First, register a user
      await supertest(app)
        .post(`${AUTH_PATH}/registration`)
        .send(registrationData)
        .expect(HttpStatus.NoContent);

      const user = await usersRepository.findByLoginOrEmail(
        registrationData.email,
      );


      await supertest(app)
        .post(`${AUTH_PATH}/registration-confirmation`)
        .send({ code: user?.emailConfirmation.confirmationCode })
        .expect(HttpStatus.NoContent);
    });

    it('should return 400 if confirmation code is invalid', async () => {
      const response = await supertest(app)
        .post(`${AUTH_PATH}/registration-confirmation`)
        .send({ code: 'invalid-code' })
        .expect(HttpStatus.BadRequest);

      expect(response.body.errorsMessages).toBeDefined();
    });

    it('should return 400 if confirmation code is expired', async () => {
      const response = await supertest(app)
        .post(`${AUTH_PATH}/registration-confirmation`)
        .send({ code: 'expired-code' })
        .expect(HttpStatus.BadRequest);

      expect(response.body.errorsMessages).toBeDefined();
    });

    it('should return 400 if confirmation code has already been applied', async () => {
      // First, register and confirm a user
      await supertest(app)
        .post(`${AUTH_PATH}/registration`)
        .send(registrationData)
        .expect(HttpStatus.NoContent);

        const user = await usersRepository.findByLoginOrEmail(
        registrationData.email,
      );
      
      const confirmationCode = user?.emailConfirmation.confirmationCode;

      await supertest(app)
        .post(`${AUTH_PATH}/registration-confirmation`)
        .send({ code: confirmationCode })
        .expect(HttpStatus.NoContent);


          await usersRepository.findByLoginOrEmail(
        registrationData.email,
      );

      // Try to confirm again with the same code
      await supertest(app)
        .post(`${AUTH_PATH}/registration-confirmation`)
        .send({ code: confirmationCode })
        .expect(HttpStatus.BadRequest);

    });
  });

  describe('POST /auth/registration-email-resending', () => {
    it('should resend registration email for existing unconfirmed user; status 204', async () => {
      // First, register a user (but don't confirm)
      await supertest(app)
        .post(`${AUTH_PATH}/registration`)
        .send(registrationData)
        .expect(HttpStatus.NoContent);

      await supertest(app)
        .post(`${AUTH_PATH}/registration-email-resending`)
        .send({ email: registrationData.email })
        .expect(HttpStatus.NoContent);
    });

    it('should return 400 if email is invalid', async () => {
      const response = await supertest(app)
        .post(`${AUTH_PATH}/registration-email-resending`)
        .send({ email: 'invalid-email' })
        .expect(HttpStatus.BadRequest);

      expect(response.body.errorsMessages).toContainEqual(
        expect.objectContaining({
          field: 'email',
          message: expect.any(String),
        }),
      );
    });

    it('should return 400 if email is not found', async () => {
      const response = await supertest(app)
        .post(`${AUTH_PATH}/registration-email-resending`)
        .send({ email: 'nonexistent@example.com' })
        .expect(HttpStatus.BadRequest);

      expect(response.body.errorsMessages).toEqual([
        { field: 'email', message: 'Not Found' },
      ]);
    });

    it('should return 400 if email is already confirmed', async () => {
      // First, register and confirm a user
      await supertest(app)
        .post(`${AUTH_PATH}/registration`)
        .send(registrationData)
        .expect(HttpStatus.NoContent);

      const user = await usersRepository.findByLoginOrEmail(
        registrationData.email,
      );

      if (!user) {
        throw new Error('User not found after registration');
      }

      const confirmationCode = user.emailConfirmation.confirmationCode;

      // Подтверждаем с настоящим кодом
      await supertest(app)
        .post(`${AUTH_PATH}/registration-confirmation`)
        .send({ code: confirmationCode })
        .expect(HttpStatus.NoContent);

      // Теперь можно тестировать повторную отправку
      const response = await supertest(app)
        .post(`${AUTH_PATH}/registration-email-resending`)
        .send({ email: registrationData.email })
        .expect(HttpStatus.BadRequest);

      expect(response.body.errorsMessages).toEqual([
        { field: 'email', message: 'Email is already confirmed' },
      ]);
    });
  });
});
