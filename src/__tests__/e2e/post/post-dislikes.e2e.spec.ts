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

describe('Post Dislikes API', () => {
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

    // Создаем 3 пользователей
    for (let i = 1; i <= 3; i++) {
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

  it('should handle dislikes from different users and like from third user; PUT /posts/:postId/like-status', async () => {
    // Дизлайкаем пост пользователями 1 и 2
    for (let i = 0; i < 2; i++) {
      await userAuth(userTokens[i])
        .put(`${POSTS_PATH}/${postId}/like-status`)
        .send({
          likeStatus: 'Dislike'
        })
        .expect(HttpStatus.NoContent);

      // После каждого дизлайка проверяем состояние поста от пользователя 1
      const response = await userAuth(userTokens[0])
        .get(`${POSTS_PATH}/${postId}`)
        .expect(HttpStatus.Ok);

      const post = response.body;

      // Проверяем количество дизлайков
      expect(post.extendedLikesInfo.likesCount).toBe(0);
      expect(post.extendedLikesInfo.dislikesCount).toBe(i + 1);
      expect(post.extendedLikesInfo.myStatus).toBe('Dislike');

      // Проверяем что newestLikes пустой (нет лайков)
      expect(post.extendedLikesInfo.newestLikes).toHaveLength(0);
    }

    // Лайкаем пост пользователем 3
    await userAuth(userTokens[2])
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Like'
      })
      .expect(HttpStatus.NoContent);

    // Проверяем состояние поста от пользователя 1
    const finalResponse = await userAuth(userTokens[0])
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    const finalPost = finalResponse.body;

    expect(finalPost.extendedLikesInfo.likesCount).toBe(1);
    expect(finalPost.extendedLikesInfo.dislikesCount).toBe(2);
    expect(finalPost.extendedLikesInfo.myStatus).toBe('Dislike');

    // Проверяем newestLikes - должен содержать один лайк от пользователя 3
    expect(finalPost.extendedLikesInfo.newestLikes).toHaveLength(1);
    expect(finalPost.extendedLikesInfo.newestLikes[0]).toEqual({
      addedAt: expect.any(String),
      userId: userIds[2],
      login: 'user3',
    });
  });

  it('should track myStatus correctly for different users after dislikes; PUT /posts/:postId/like-status', async () => {
    // Дизлайкаем пост пользователями 1 и 2
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Dislike'
      })
      .expect(HttpStatus.NoContent);

    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Dislike'
      })
      .expect(HttpStatus.NoContent);

    // Проверяем состояние для пользователя 1
    const user1Response = await userAuth(userTokens[0])
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    expect(user1Response.body.extendedLikesInfo.myStatus).toBe('Dislike');

    // Проверяем состояние для пользователя 2
    const user2Response = await userAuth(userTokens[1])
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    expect(user2Response.body.extendedLikesInfo.myStatus).toBe('Dislike');

    // Проверяем состояние для пользователя 3 (не голосовал)
    const user3Response = await userAuth(userTokens[2])
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    expect(user3Response.body.extendedLikesInfo.myStatus).toBe('None');

    // Общая проверка количества
    const commonLikesInfo = user1Response.body.extendedLikesInfo;
    expect(commonLikesInfo.likesCount).toBe(0);
    expect(commonLikesInfo.dislikesCount).toBe(2);
    expect(commonLikesInfo.newestLikes).toHaveLength(0);
  });

  it('should change dislike to like and back correctly; PUT /posts/:postId/like-status', async () => {
    // Дизлайкаем пост
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Dislike'
      })
      .expect(HttpStatus.NoContent);

    // Проверяем состояние
    const dislikeResponse = await userAuth(userTokens[0])
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    expect(dislikeResponse.body.extendedLikesInfo.myStatus).toBe('Dislike');
    expect(dislikeResponse.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(dislikeResponse.body.extendedLikesInfo.likesCount).toBe(0);

    // Меняем на лайк
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Like'
      })
      .expect(HttpStatus.NoContent);

    // Проверяем состояние
    const likeResponse = await userAuth(userTokens[0])
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    expect(likeResponse.body.extendedLikesInfo.myStatus).toBe('Like');
    expect(likeResponse.body.extendedLikesInfo.dislikesCount).toBe(0);
    expect(likeResponse.body.extendedLikesInfo.likesCount).toBe(1);
    expect(likeResponse.body.extendedLikesInfo.newestLikes).toHaveLength(1);
    expect(likeResponse.body.extendedLikesInfo.newestLikes[0].userId).toBe(userIds[0]);
  });
});
