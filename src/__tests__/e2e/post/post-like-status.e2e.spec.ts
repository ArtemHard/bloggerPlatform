import supertest from 'supertest';
import express from 'express';
import { setupApp } from '../../../setup-app';
import { HttpStatus } from '../../../core/types/http-statuses';
import { POSTS_PATH } from '../../../core/paths/paths';
import { runDB, stopDb } from '../../../db/mongo.db';
import { SETTINGS } from '../../../core/settings/settings';
import { clearDb } from '../../../core/utils/clear-db';

// Mock rate limiting middleware to bypass rate limiting in tests
jest.mock('../../../core/middlewars/rate-limit.middleware', () => ({
  rateLimitMiddleware: async (_: any, __: any, next: any) => {
    next();
  },
}));

describe('Post Like Status API', () => {
  const app = express();
  setupApp(app);

  let accessToken: string;

  function auth() {
    return supertest.agent(app).auth('admin', 'qwerty', { type: 'basic' });
  }

  function userAuth(token: string) {
    return supertest.agent(app).set('Authorization', `Bearer ${token}`);
  }

  beforeAll(async () => {
    await runDB(SETTINGS.MONGO_URL);
  }, 15000);

  beforeEach(async () => {
    await clearDb(app);
    await auth().delete('/testing/all-data').expect(HttpStatus.NoContent);

    // Создаем тестового пользователя
    await auth()
      .post('/users')
      .send({
        login: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
      })
      .expect(HttpStatus.Created);

    // Получаем access token
    const loginResponse = await supertest(app)
      .post('/auth/login')
      .send({
        loginOrEmail: 'testuser',
        password: 'password123',
      })
      .expect(HttpStatus.Ok);

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await stopDb();
  });

  // Тест: попытка установить лайк несуществующему посту
  it('should return 404 when trying to like a non-existent post; PUT /posts/:postId/like-status', async () => {
    const nonExistentPostId = '6507a1b1b1a1b1a1b1a1b1a1'; // Несуществующий ID
    const likeStatusData = {
      likeStatus: 'Like'
    };

    const response = await userAuth(accessToken)
      .put(`${POSTS_PATH}/${nonExistentPostId}/like-status`)
      .send(likeStatusData)
      .expect(HttpStatus.NotFound);

    // Проверяем, что ответ содержит информацию об ошибке
    expect(response.body).toHaveProperty('errorsMessages');
    expect(Array.isArray(response.body.errorsMessages)).toBe(true);
    expect(response.body.errorsMessages.length).toBeGreaterThan(0);
    expect(response.body.errorsMessages[0]).toHaveProperty('message');
    expect(response.body.errorsMessages[0]).toHaveProperty('field');
  });

  // Дополнительный тест: проверка валидации likeStatus
  it('should return 400 when likeStatus is invalid; PUT /posts/:postId/like-status', async () => {
    const nonExistentPostId = '6507a1b1b1a1b1a1b1a1b1a1';
    const invalidLikeStatusData = {
      likeStatus: 'InvalidStatus'
    };

    const response = await userAuth(accessToken)
      .put(`${POSTS_PATH}/${nonExistentPostId}/like-status`)
      .send(invalidLikeStatusData)
      .expect(HttpStatus.BadRequest);

    expect(response.body).toHaveProperty('errorsMessages');
    expect(Array.isArray(response.body.errorsMessages)).toBe(true);
    const likeStatusError = response.body.errorsMessages.find(
      (error: any) => error.field === 'likeStatus'
    );
    expect(likeStatusError).toBeDefined();
    expect(likeStatusError.message).toContain('likeStatus must be one of: None, Like, Dislike');
  });

  // Тест: проверка разных статусов лайка для несуществующего поста
  it('should return 404 for all likeStatus values when post does not exist; PUT /posts/:postId/like-status', async () => {
    const nonExistentPostId = '6507a1b1b1a1b1a1b1a1b1a1';
    const likeStatusValues = ['None', 'Like', 'Dislike'];

    for (const status of likeStatusValues) {
      await userAuth(accessToken)
        .put(`${POSTS_PATH}/${nonExistentPostId}/like-status`)
        .send({ likeStatus: status })
        .expect(HttpStatus.NotFound);
    }
  });

  // Тест: проверка без авторизации
  it('should return 401 when trying to like without authentication; PUT /posts/:postId/like-status', async () => {
    const nonExistentPostId = '6507a1b1b1a1b1a1b1a1b1a1';
    const likeStatusData = {
      likeStatus: 'Like'
    };

    await supertest
      .agent(app)
      .put(`${POSTS_PATH}/${nonExistentPostId}/like-status`)
      .send(likeStatusData)
      .expect(HttpStatus.Unauthorized);
  });
});
