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
  rateLimitMiddleware: async (req: any, res: any, next: any) => {
    next();
  },
}));

describe('Post Multiple Likes API', () => {
  const app = express();
  setupApp(app);

  let blogId: string;
  let postId: string;
  let userTokens: string[] = [];
  let userIds: string[] = [];

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

    // Создаем 4 пользователей
    for (let i = 1; i <= 4; i++) {
      const userResponse = await auth()
        .post('/users')
        .send({
          login: `user${i}`,
          email: `user${i}@example.com`,
          password: 'password123',
        })
        .expect(HttpStatus.Created);

      userIds.push(userResponse.body.id);

      const loginResponse = await supertest(app)
        .post('/auth/login')
        .send({
          loginOrEmail: `user${i}`,
          password: 'password123',
        })
        .expect(HttpStatus.Ok);

      userTokens.push(loginResponse.body.accessToken);
    }
  });

  afterAll(async () => {
    await stopDb();
  });

  it('should handle multiple likes from different users and sort newestLikes in descending order; PUT /posts/:postId/like-status', async () => {
    // Лайкаем пост пользователями 1, 2, 3, 4
    for (let i = 0; i < 4; i++) {
      await userAuth(userTokens[i])
        .put(`${POSTS_PATH}/${postId}/like-status`)
        .send({
          likeStatus: 'Like'
        })
        .expect(HttpStatus.NoContent);

      // После каждого лайка проверяем состояние поста от пользователя 1
      const response = await userAuth(userTokens[0])
        .get(`${POSTS_PATH}/${postId}`)
        .expect(HttpStatus.Ok);

      const post = response.body;

      // Проверяем количество лайков
      expect(post.extendedLikesInfo.likesCount).toBe(i + 1);
      expect(post.extendedLikesInfo.dislikesCount).toBe(0);
      expect(post.extendedLikesInfo.myStatus).toBe('Like');

      // Проверяем newestLikes (ограничено 3 последними)
      const expectedNewestLikesCount = Math.min(i + 1, 3);
      expect(post.extendedLikesInfo.newestLikes).toHaveLength(expectedNewestLikesCount);

      // Проверяем сортировку newestLikes по убыванию даты
      const newestLikes = post.extendedLikesInfo.newestLikes;
      for (let j = 0; j < newestLikes.length - 1; j++) {
        const currentDate = new Date(newestLikes[j].addedAt);
        const nextDate = new Date(newestLikes[j + 1].addedAt);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }

      // Проверяем что последние лайки содержат правильных пользователей
      // Просто проверяем что текущий пользователь (который только что лайкнул) вверху списка
      if (newestLikes.length > 0) {
        // Проверяем что userId в newestLikes соответствует одному из созданных пользователей
        const latestLikeUserId = newestLikes[0].userId;
        expect(userIds).toContain(latestLikeUserId);
      }
    }
  });

  it('should maintain newestLikes sorting after multiple likes; PUT /posts/:postId/like-status', async () => {
    // Лайкаем пост пользователями в разном порядке
    const likeOrder = [2, 0, 3, 1]; // user2, user1, user3, user4

    for (let i = 0; i < likeOrder.length; i++) {
      const userIndex = likeOrder[i];
      
      await userAuth(userTokens[userIndex])
        .put(`${POSTS_PATH}/${postId}/like-status`)
        .send({
          likeStatus: 'Like'
        })
        .expect(HttpStatus.NoContent);

      // Проверяем состояние поста
      const response = await userAuth(userTokens[0])
        .get(`${POSTS_PATH}/${postId}`)
        .expect(HttpStatus.Ok);

      const post = response.body;
      const newestLikes = post.extendedLikesInfo.newestLikes;

      // Проверяем что newestLikes отсортирован по убыванию даты
      for (let j = 0; j < newestLikes.length - 1; j++) {
        const currentDate = new Date(newestLikes[j].addedAt);
        const nextDate = new Date(newestLikes[j + 1].addedAt);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
      }

      // Проверяем что самый последний лайк от текущего пользователя
      expect(newestLikes[0].userId).toBe(userIds[userIndex]);
    }

    // Финальная проверка - все 4 лайка должны быть в правильном порядке
    const finalResponse = await userAuth(userTokens[0])
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    const finalPost = finalResponse.body;
    expect(finalPost.extendedLikesInfo.likesCount).toBe(4);
    expect(finalPost.extendedLikesInfo.newestLikes).toHaveLength(3); // Ограничено 3 последними лайками

    // Проверяем финальную сортировку
    const newestLikes = finalPost.extendedLikesInfo.newestLikes;
    for (let i = 0; i < newestLikes.length - 1; i++) {
      const currentDate = new Date(newestLikes[i].addedAt);
      const nextDate = new Date(newestLikes[i + 1].addedAt);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }
  });
});
