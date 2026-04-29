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

describe('Post Like Dislike None Sequence API', () => {
  const app = express();
  setupApp(app);

  let blogId: string;
  let postId: string;
  let accessToken: string;
  let userId: string;

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

    // Создаем пользователя
    const userResponse = await auth()
      .post('/users')
      .send({
        login: 'testuser',
        email: 'testuser@example.com',
        password: 'password123',
      })
      .expect(HttpStatus.Created);

    userId = userResponse.body.id;

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

  it('should handle like -> dislike -> none sequence correctly; PUT /posts/:postId/like-status', async () => {
    // 1. Лайкаем пост
    await userAuth(accessToken)
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Like'
      })
      .expect(HttpStatus.NoContent);

    // Проверяем состояние после лайка
    const likeResponse = await userAuth(accessToken)
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    const likePost = likeResponse.body;

    expect(likePost.extendedLikesInfo.likesCount).toBe(1);
    expect(likePost.extendedLikesInfo.dislikesCount).toBe(0);
    expect(likePost.extendedLikesInfo.myStatus).toBe('Like');
    expect(likePost.extendedLikesInfo.newestLikes).toHaveLength(1);
    expect(likePost.extendedLikesInfo.newestLikes[0]).toEqual({
      addedAt: expect.any(String),
      userId: userId,
      login: 'testuser',
    });

    // 2. Меняем на дизлайк
    await userAuth(accessToken)
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Dislike'
      })
      .expect(HttpStatus.NoContent);

    // Проверяем состояние после дизлайка
    const dislikeResponse = await userAuth(accessToken)
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    const dislikePost = dislikeResponse.body;

    expect(dislikePost.extendedLikesInfo.likesCount).toBe(0);
    expect(dislikePost.extendedLikesInfo.dislikesCount).toBe(1);
    expect(dislikePost.extendedLikesInfo.myStatus).toBe('Dislike');
    expect(dislikePost.extendedLikesInfo.newestLikes).toHaveLength(0);

    // 3. Устанавливаем None
    await userAuth(accessToken)
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'None'
      })
      .expect(HttpStatus.NoContent);

    // Проверяем состояние после None
    const noneResponse = await userAuth(accessToken)
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    const nonePost = noneResponse.body;

    expect(nonePost.extendedLikesInfo.likesCount).toBe(0);
    expect(nonePost.extendedLikesInfo.dislikesCount).toBe(0);
    expect(nonePost.extendedLikesInfo.myStatus).toBe('None');
    expect(nonePost.extendedLikesInfo.newestLikes).toHaveLength(0);
  });

  it('should handle none -> like -> dislike -> like sequence correctly; PUT /posts/:postId/like-status', async () => {
    // Начальное состояние - None
    const initialResponse = await userAuth(accessToken)
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    expect(initialResponse.body.extendedLikesInfo.myStatus).toBe('None');

    // 1. Лайкаем
    await userAuth(accessToken)
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Like'
      })
      .expect(HttpStatus.NoContent);

    const likeResponse = await userAuth(accessToken)
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    expect(likeResponse.body.extendedLikesInfo.myStatus).toBe('Like');
    expect(likeResponse.body.extendedLikesInfo.likesCount).toBe(1);
    expect(likeResponse.body.extendedLikesInfo.newestLikes).toHaveLength(1);

    // 2. Меняем на дизлайк
    await userAuth(accessToken)
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Dislike'
      })
      .expect(HttpStatus.NoContent);

    const dislikeResponse = await userAuth(accessToken)
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    expect(dislikeResponse.body.extendedLikesInfo.myStatus).toBe('Dislike');
    expect(dislikeResponse.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(dislikeResponse.body.extendedLikesInfo.newestLikes).toHaveLength(0);

    // 3. Возвращаем на лайк
    await userAuth(accessToken)
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Like'
      })
      .expect(HttpStatus.NoContent);

    const finalLikeResponse = await userAuth(accessToken)
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    expect(finalLikeResponse.body.extendedLikesInfo.myStatus).toBe('Like');
    expect(finalLikeResponse.body.extendedLikesInfo.likesCount).toBe(1);
    expect(finalLikeResponse.body.extendedLikesInfo.dislikesCount).toBe(0);
    expect(finalLikeResponse.body.extendedLikesInfo.newestLikes).toHaveLength(1);
    expect(finalLikeResponse.body.extendedLikesInfo.newestLikes[0].login).toBe('testuser');
  });

  it('should handle dislike -> like -> none sequence correctly; PUT /posts/:postId/like-status', async () => {
    // 1. Дизлайкаем пост
    await userAuth(accessToken)
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Dislike'
      })
      .expect(HttpStatus.NoContent);

    const dislikeResponse = await userAuth(accessToken)
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    expect(dislikeResponse.body.extendedLikesInfo.myStatus).toBe('Dislike');
    expect(dislikeResponse.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(dislikeResponse.body.extendedLikesInfo.newestLikes).toHaveLength(0);

    // 2. Меняем на лайк
    await userAuth(accessToken)
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Like'
      })
      .expect(HttpStatus.NoContent);

    const likeResponse = await userAuth(accessToken)
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    expect(likeResponse.body.extendedLikesInfo.myStatus).toBe('Like');
    expect(likeResponse.body.extendedLikesInfo.likesCount).toBe(1);
    expect(likeResponse.body.extendedLikesInfo.dislikesCount).toBe(0);
    expect(likeResponse.body.extendedLikesInfo.newestLikes).toHaveLength(1);

    // 3. Устанавливаем None
    await userAuth(accessToken)
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'None'
      })
      .expect(HttpStatus.NoContent);

    const noneResponse = await userAuth(accessToken)
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    expect(noneResponse.body.extendedLikesInfo.myStatus).toBe('None');
    expect(noneResponse.body.extendedLikesInfo.likesCount).toBe(0);
    expect(noneResponse.body.extendedLikesInfo.dislikesCount).toBe(0);
    expect(noneResponse.body.extendedLikesInfo.newestLikes).toHaveLength(0);
  });

  it('should handle multiple rapid status changes correctly; PUT /posts/:postId/like-status', async () => {
    // Быстрая смена статусов: Like -> Dislike -> Like -> None -> Like
    const statusSequence = ['Like', 'Dislike', 'Like', 'None', 'Like'];

    for (const status of statusSequence) {
      await userAuth(accessToken)
        .put(`${POSTS_PATH}/${postId}/like-status`)
        .send({
          likeStatus: status
        })
        .expect(HttpStatus.NoContent);

      const response = await userAuth(accessToken)
        .get(`${POSTS_PATH}/${postId}`)
        .expect(HttpStatus.Ok);

      const post = response.body;

      switch (status) {
        case 'Like':
          expect(post.extendedLikesInfo.myStatus).toBe('Like');
          expect(post.extendedLikesInfo.likesCount).toBe(1);
          expect(post.extendedLikesInfo.dislikesCount).toBe(0);
          expect(post.extendedLikesInfo.newestLikes).toHaveLength(1);
          break;
        case 'Dislike':
          expect(post.extendedLikesInfo.myStatus).toBe('Dislike');
          expect(post.extendedLikesInfo.likesCount).toBe(0);
          expect(post.extendedLikesInfo.dislikesCount).toBe(1);
          expect(post.extendedLikesInfo.newestLikes).toHaveLength(0);
          break;
        case 'None':
          expect(post.extendedLikesInfo.myStatus).toBe('None');
          expect(post.extendedLikesInfo.likesCount).toBe(0);
          expect(post.extendedLikesInfo.dislikesCount).toBe(0);
          expect(post.extendedLikesInfo.newestLikes).toHaveLength(0);
          break;
      }
    }
  });
});
