import supertest from 'supertest';
import express from 'express';
import { setupApp } from '../../../setup-app';
import { HttpStatus } from '../../../core/types/http-statuses';
import { POSTS_PATH, BLOGS_PATH } from '../../../core/paths/paths';
import { runDB, stopDb } from '../../../db/mongo.db';
import { SETTINGS } from '../../../core/settings/settings';
import { clearDb } from '../../../core/utils/clear-db';

// Mock rate limiting middleware to bypass rate limiting in tests
jest.mock('../../../core/middlewars/rate-limit.middleware', () => ({
  rateLimitMiddleware: async (_: any, __: any, next: any) => {
    next();
  },
}));

describe('Post Unauthorized Get API', () => {
  const app = express();
  setupApp(app);

  let blogId: string;
  let postId: string;
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

    // Создаем блог
    const blogResponse = await auth()
      .post(BLOGS_PATH)
      .send({
        name: 'Test Blog',
        description: 'Test Description',
        websiteUrl: 'https://test-blog.com',
      })
      .expect(HttpStatus.Created);

    blogId = blogResponse.body.id;

    // Создаем пост
    const postResponse = await auth()
      .post(POSTS_PATH)
      .send({
        title: 'Test Post',
        shortDescription: 'Test Short Description',
        content: 'Test Content',
        blogId: blogId,
      })
      .expect(HttpStatus.Created);

    postId = postResponse.body.id;

    // Создаем пользователя для лайка
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

    // Ставим лайк от пользователя
    await userAuth(accessToken)
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Like'
      })
      .expect(HttpStatus.NoContent);
  });

  afterAll(async () => {
    await stopDb();
  });

  it('should return liked post with myStatus: None for unauthorized user; GET /posts/:postId', async () => {
    const response = await supertest(app)
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    const post = response.body;

    // Проверяем структуру поста
    expect(post).toEqual({
      id: postId,
      title: 'Test Post',
      shortDescription: 'Test Short Description',
      content: 'Test Content',
      blogId: blogId,
      blogName: 'Test Blog',
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 1,
        dislikesCount: 0,
        myStatus: 'None', // Для неавторизованного пользователя
        newestLikes: expect.arrayContaining([
          expect.objectContaining({
            addedAt: expect.any(String),
            userId: expect.any(String),
            login: 'testuser',
          }),
        ]),
      },
    });

    // Проверяем, что newestLikes отсортирован по убыванию даты
    const newestLikes = post.extendedLikesInfo.newestLikes;
    if (newestLikes.length > 1) {
      for (let i = 0; i < newestLikes.length - 1; i++) {
        const currentDate = new Date(newestLikes[i].addedAt);
        const nextDate = new Date(newestLikes[i + 1].addedAt);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }
    }
  });

  it('should return post with myStatus: None for unauthorized user even if post has dislikes; GET /posts/:postId', async () => {
    // Создаем второго пользователя и ставим дизлайк
    await auth()
      .post('/users')
      .send({
        login: 'testuser2',
        email: 'testuser2@example.com',
        password: 'password123',
      })
      .expect(HttpStatus.Created);

    const loginResponse2 = await supertest(app)
      .post('/auth/login')
      .send({
        loginOrEmail: 'testuser2',
        password: 'password123',
      })
      .expect(HttpStatus.Ok);

    const accessToken2 = loginResponse2.body.accessToken;

    await userAuth(accessToken2)
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Dislike'
      })
      .expect(HttpStatus.NoContent);

    const response = await supertest(app)
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    const post = response.body;

    expect(post.extendedLikesInfo).toEqual({
      likesCount: 1,
      dislikesCount: 1,
      myStatus: 'None', // Для неавторизованного пользователя
      newestLikes: expect.arrayContaining([
        expect.objectContaining({
          addedAt: expect.any(String),
          userId: expect.any(String),
          login: 'testuser',
        }),
      ]),
    });
  });

  it('should return 404 for non-existent post; GET /posts/:postId', async () => {
    const nonExistentPostId = '6507a1b1b1a1b1a1b1a1b1a1';

    await supertest(app)
      .get(`${POSTS_PATH}/${nonExistentPostId}`)
      .expect(HttpStatus.NotFound);
  });
});
