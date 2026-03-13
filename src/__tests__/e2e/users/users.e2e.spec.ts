import * as supertest from 'supertest';
import express from 'express';
import { setupApp } from '../../../setup-app';
import { HttpStatus } from '../../../core/types/http-statuses';
import { CreateUserDto } from '../../../domain/users/types/create-user.dto';
import { USERS_PATH } from '../../../core/paths/paths';
import { runDB, stopDb } from '../../../db/mongo.db';
import { SETTINGS } from '../../../core/settings/settings';
import { clearDb } from '../../../core/utils/clear-db';
import { UserSortField } from '../../../domain/users/routers/handlers/input/user-sort-field';

describe('Users API', () => {
  const app = express();
  setupApp(app);

  const testUserData: CreateUserDto = {
    login: 'testuser',
    email: 'testuser@example.com',
    password: 'password123',
  };

  function auth() {
    return supertest.agent(app).auth('admin', 'qwerty', { type: 'basic' });
  }

  beforeAll(async () => {
    await runDB(SETTINGS.MONGO_URL);
    // await clearDb(app);
  }, 15000);

  //   afterAll(async () => {
  //     await stopDb();
  //   }, 10000);

  beforeEach(async () => {
    await clearDb(app);
  }, 10000);

  afterAll(async () => {
    await stopDb();
  }, 10000);

  describe('GET /users', () => {
    it('should return users list; GET /users', async () => {
      await auth()
        .post(USERS_PATH)
        .send(testUserData)
        .expect(HttpStatus.Created);

      await auth()
        .post(USERS_PATH)
        .send({
          ...testUserData,
          login: 'another',
          email: 'another@example.com',
        })
        .expect(HttpStatus.Created);

      const userListResponse = await auth()
        .get(USERS_PATH)
        .expect(HttpStatus.Ok);

      expect(userListResponse.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: [
          {
            id: expect.any(String),
            login: 'another',
            email: 'another@example.com',
            createdAt: expect.stringMatching(
              /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/, // ISO 8601 с миллисекундами
            ),
          },
          {
            id: expect.any(String),
            login: 'testuser',
            email: 'testuser@example.com',
            createdAt: expect.stringMatching(
              /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/, // ISO 8601 с миллисекундами
            ),
          },
        ],
      });

      expect(userListResponse.body.items.length).toBeGreaterThanOrEqual(2);
    });

    it('should return users list with searchLoginTerm; GET /users?searchLoginTerm=', async () => {
      await auth()
        .post(USERS_PATH)
        .send({
          ...testUserData,
          login: 'searchlog',
          email: 'searchlogin@example.com',
        })
        .expect(HttpStatus.Created);

      const userListResponse = await auth()
        .get(USERS_PATH)
        .query({ searchLoginTerm: 'search' })
        .expect(HttpStatus.Ok);

      expect(userListResponse.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            login: 'searchlog',
            email: 'searchlogin@example.com',
            createdAt: expect.stringMatching(
              /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/, // ISO 8601 с миллисекундами
            ),
          },
        ],
      });
    });

    it('should return users list with searchEmailTerm; GET /users?searchEmailTerm=', async () => {
      await auth()
        .post(USERS_PATH)
        .send({
          ...testUserData,
          login: 'emailuser',
          email: 'findme@example.com',
        })
        .expect(HttpStatus.Created);

      const userListResponse = await auth()
        .get(USERS_PATH)
        .query({ searchEmailTerm: 'findme' })
        .expect(HttpStatus.Ok);

      expect(userListResponse.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            login: 'emailuser',
            email: 'findme@example.com',
            createdAt: expect.stringMatching(
              /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/, // ISO 8601 с миллисекундами
            ),
          },
        ],
      });
    });

    it('should return users sorted by login in ascending order; GET /users?sortBy=login&sortDirection=asc', async () => {
      const usersData = [
        {
          login: 'charlie',
          email: 'charlie@example.com',
          password: 'password123',
        },
        { login: 'alice', email: 'alice@example.com', password: 'password123' },
        { login: 'bob', email: 'bob@example.com', password: 'password123' },
      ];

      for (const userData of usersData) {
        await auth().post(USERS_PATH).send(userData).expect(HttpStatus.Created);
      }

      const userListResponse = await auth()
        .get(USERS_PATH)
        .query({ sortBy: UserSortField.login, sortDirection: 'asc' })
        .expect(HttpStatus.Ok);

      const logins = userListResponse.body.items.map((user: any) => user.login);
      expect(logins).toEqual(['alice', 'bob', 'charlie']);
    });

    it('should return users sorted by createdAt in descending order (default); GET /users', async () => {
      const usersData = [
        { login: 'first', email: 'first@example.com', password: 'password123' },
        {
          login: 'second',
          email: 'second@example.com',
          password: 'password123',
        },
        { login: 'third', email: 'third@example.com', password: 'password123' },
      ];

      const createdIds = [];
      for (const userData of usersData) {
        const response = await auth()
          .post(USERS_PATH)
          .send(userData)
          .expect(HttpStatus.Created);
        createdIds.push(response.body.id);
      }

      const userListResponse = await auth()
        .get(USERS_PATH)
        .expect(HttpStatus.Ok);

      // По умолчанию сортировка по createdAt desc
      const returnedIds = userListResponse.body.items.map(
        (user: any) => user.id,
      );
      // Последний созданный должен быть первым
      expect(returnedIds[0]).toBe(createdIds[2]);
      expect(returnedIds[1]).toBe(createdIds[1]);
      expect(returnedIds[2]).toBe(createdIds[0]);
    });
  });

describe('DELETE /users/:id', () => {
  it('should delete user by id; DELETE /users/:id', async () => {
    const createUserResponse = await auth()
      .post(USERS_PATH)
      .send(testUserData)
      .expect(HttpStatus.Created);

    const userId = createUserResponse.body.id;

    await auth().delete(`${USERS_PATH}/${userId}`).expect(HttpStatus.NoContent);

    await auth().get(`${USERS_PATH}/${userId}`).expect(HttpStatus.NotFound);
  });

  it('should return 404 when trying to delete non-existent user', async () => {
    const nonExistentId = '60f7a1b7c9d6b75f8c8d7e9f'; 

    await auth()
      .delete(`${USERS_PATH}/${nonExistentId}`)
      .expect(HttpStatus.NotFound);
  });
});

});
