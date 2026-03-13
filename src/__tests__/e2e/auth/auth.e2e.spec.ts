import supertest from 'supertest';
import express from 'express';
import { setupApp } from '../../../setup-app';
import { HttpStatus } from '../../../core/types/http-statuses';
import { AUTH_PATH } from '../../../core/paths/paths';
import { runDB, stopDb } from '../../../db/mongo.db';
import { SETTINGS } from '../../../core/settings/settings';
import { clearDb } from '../../../core/utils/clear-db';
import { log } from 'console';

describe('Auth API', () => {
  const app = express();
  setupApp(app);

  const testLoginData = {
    loginOrEmail: 'lg-697232',
    password: 'qwerty1'
  };

  const wrongLoginData = {
    loginOrEmail: 'wronglogin',
    password: 'qwerty1'
  };

  const wrongPasswordData = {
    loginOrEmail: 'lg-697232',
    password: 'wrongpassword'
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
    it('should sign in user; status 204', async () => {
      // First, create a user through the users API
      const createUserResponse = await supertest(app)
        .post('/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'lg-697232',
          email: 'lg-697232@example.com',
          password: 'qwerty1'
        })
        .expect(HttpStatus.Created);

      expect(createUserResponse.body).toEqual({
        id: expect.any(String),
        login: 'lg-697232',
        email: 'lg-697232@example.com',
        createdAt: expect.stringMatching(
          /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/
        ),
      });

      // Now test login
      const loginResponse = await supertest(app)
        .post(`${AUTH_PATH}/login`)
        .send(testLoginData)
        .expect(HttpStatus.NoContent);

      log('loginResponse >>>>', loginResponse.body);

      expect(Object.keys(loginResponse.body)).toHaveLength(0);

    });

    it('should return error if passed wrong login; status 401', async () => {
      // Create a user first
      await supertest(app)
        .post('/users')
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({
          login: 'lg-697232',
          email: 'lg-697232@example.com',
          password: 'qwerty1'
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
          password: 'qwerty1'
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
          password: 'password123'
        })
        .expect(HttpStatus.Unauthorized);
    });

    it('should return error for invalid input; status 400', async () => {
      // Test with missing loginOrEmail
      await supertest(app)
        .post(`${AUTH_PATH}/login`)
        .send({
          password: 'qwerty1'
        })
        .expect(HttpStatus.BadRequest);

      // Test with missing password
      await supertest(app)
        .post(`${AUTH_PATH}/login`)
        .send({
          loginOrEmail: 'lg-697232'
        })
        .expect(HttpStatus.BadRequest);

      // Test with empty strings
      await supertest(app)
        .post(`${AUTH_PATH}/login`)
        .send({
          loginOrEmail: '',
          password: ''
        })
        .expect(HttpStatus.BadRequest);
    });
  });
});
