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

describe('Post Multiple Users Interaction API', () => {
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

    // Создаем 2 пользователей
    for (let i = 1; i <= 2; i++) {
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

  it('should handle user1 likes post then user2 dislikes it; PUT /posts/:postId/like-status', async () => {
    // Пользователь 1 лайкает пост
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Like'
      })
      .expect(HttpStatus.NoContent);

    // Проверяем состояние от пользователя 1
    const user1AfterLikeResponse = await userAuth(userTokens[0])
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    const user1AfterLikePost = user1AfterLikeResponse.body;

    expect(user1AfterLikePost.extendedLikesInfo.likesCount).toBe(1);
    expect(user1AfterLikePost.extendedLikesInfo.dislikesCount).toBe(0);
    expect(user1AfterLikePost.extendedLikesInfo.myStatus).toBe('Like');
    expect(user1AfterLikePost.extendedLikesInfo.newestLikes).toHaveLength(1);
    expect(user1AfterLikePost.extendedLikesInfo.newestLikes[0]).toEqual({
      addedAt: expect.any(String),
      userId: userIds[0],
      login: 'user1',
    });

    // Пользователь 2 дизлайкает пост
    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Dislike'
      })
      .expect(HttpStatus.NoContent);

    // Проверяем состояние от пользователя 1
    const user1AfterDislikeResponse = await userAuth(userTokens[0])
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    const user1AfterDislikePost = user1AfterDislikeResponse.body;

    expect(user1AfterDislikePost.extendedLikesInfo.likesCount).toBe(1);
    expect(user1AfterDislikePost.extendedLikesInfo.dislikesCount).toBe(1);
    expect(user1AfterDislikePost.extendedLikesInfo.myStatus).toBe('Like');
    expect(user1AfterDislikePost.extendedLikesInfo.newestLikes).toHaveLength(1);
    expect(user1AfterDislikePost.extendedLikesInfo.newestLikes[0]).toEqual({
      addedAt: expect.any(String),
      userId: userIds[0],
      login: 'user1',
    });

    // Проверяем состояние от пользователя 2
    const user2Response = await userAuth(userTokens[1])
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    const user2Post = user2Response.body;

    expect(user2Post.extendedLikesInfo.likesCount).toBe(1);
    expect(user2Post.extendedLikesInfo.dislikesCount).toBe(1);
    expect(user2Post.extendedLikesInfo.myStatus).toBe('Dislike');
    expect(user2Post.extendedLikesInfo.newestLikes).toHaveLength(1);
    expect(user2Post.extendedLikesInfo.newestLikes[0]).toEqual({
      addedAt: expect.any(String),
      userId: userIds[0],
      login: 'user1',
    });
  });

  it('should handle user1 likes post then user2 dislikes then user1 checks; PUT /posts/:postId/like-status', async () => {
    // Пользователь 1 лайкает пост
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Like'
      })
      .expect(HttpStatus.NoContent);

    // Пользователь 2 дизлайкает пост
    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Dislike'
      })
      .expect(HttpStatus.NoContent);

    // Проверяем состояние от пользователя 1
    const user1Response = await userAuth(userTokens[0])
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    const user1Post = user1Response.body;

    expect(user1Post.extendedLikesInfo.likesCount).toBe(1);
    expect(user1Post.extendedLikesInfo.dislikesCount).toBe(1);
    expect(user1Post.extendedLikesInfo.myStatus).toBe('Like');
    expect(user1Post.extendedLikesInfo.newestLikes).toHaveLength(1);
    expect(user1Post.extendedLikesInfo.newestLikes[0]).toEqual({
      addedAt: expect.any(String),
      userId: userIds[0],
      login: 'user1',
    });
  });

  it('should handle user1 likes then user2 likes then user1 changes to dislike; PUT /posts/:postId/like-status', async () => {
    // Пользователь 1 лайкает пост
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Like'
      })
      .expect(HttpStatus.NoContent);

    // Пользователь 2 лайкает пост
    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Like'
      })
      .expect(HttpStatus.NoContent);

    // Проверяем состояние от пользователя 1
    const user1AfterBothLikesResponse = await userAuth(userTokens[0])
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    const user1AfterBothLikesPost = user1AfterBothLikesResponse.body;

    expect(user1AfterBothLikesPost.extendedLikesInfo.likesCount).toBe(2);
    expect(user1AfterBothLikesPost.extendedLikesInfo.dislikesCount).toBe(0);
    expect(user1AfterBothLikesPost.extendedLikesInfo.myStatus).toBe('Like');
    expect(user1AfterBothLikesPost.extendedLikesInfo.newestLikes).toHaveLength(2);

    // Проверяем сортировку newestLikes
    const newestLikes = user1AfterBothLikesPost.extendedLikesInfo.newestLikes;
    for (let i = 0; i < newestLikes.length - 1; i++) {
      const currentDate = new Date(newestLikes[i].addedAt);
      const nextDate = new Date(newestLikes[i + 1].addedAt);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }

    // Пользователь 1 меняет на дизлайк
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Dislike'
      })
      .expect(HttpStatus.NoContent);

    // Проверяем состояние от пользователя 1
    const user1FinalResponse = await userAuth(userTokens[0])
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    const user1FinalPost = user1FinalResponse.body;

    expect(user1FinalPost.extendedLikesInfo.likesCount).toBe(1);
    expect(user1FinalPost.extendedLikesInfo.dislikesCount).toBe(1);
    expect(user1FinalPost.extendedLikesInfo.myStatus).toBe('Dislike');
    expect(user1FinalPost.extendedLikesInfo.newestLikes).toHaveLength(1);
    expect(user1FinalPost.extendedLikesInfo.newestLikes[0]).toEqual({
      addedAt: expect.any(String),
      userId: userIds[1],
      login: 'user2',
    });

    // Проверяем состояние от пользователя 2
    const user2FinalResponse = await userAuth(userTokens[1])
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    const user2FinalPost = user2FinalResponse.body;

    expect(user2FinalPost.extendedLikesInfo.likesCount).toBe(1);
    expect(user2FinalPost.extendedLikesInfo.dislikesCount).toBe(1);
    expect(user2FinalPost.extendedLikesInfo.myStatus).toBe('Like');
    expect(user2FinalPost.extendedLikesInfo.newestLikes).toHaveLength(1);
    expect(user2FinalPost.extendedLikesInfo.newestLikes[0]).toEqual({
      addedAt: expect.any(String),
      userId: userIds[1],
      login: 'user2',
    });
  });

  it('should handle user1 likes then user2 dislikes then user1 removes like; PUT /posts/:postId/like-status', async () => {
    // Пользователь 1 лайкает пост
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Like'
      })
      .expect(HttpStatus.NoContent);

    // Пользователь 2 дизлайкает пост
    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'Dislike'
      })
      .expect(HttpStatus.NoContent);

    // Пользователь 1 убирает лайк (ставит None)
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postId}/like-status`)
      .send({
        likeStatus: 'None'
      })
      .expect(HttpStatus.NoContent);

    // Проверяем состояние от пользователя 1
    const user1Response = await userAuth(userTokens[0])
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    const user1Post = user1Response.body;

    expect(user1Post.extendedLikesInfo.likesCount).toBe(0);
    expect(user1Post.extendedLikesInfo.dislikesCount).toBe(1);
    expect(user1Post.extendedLikesInfo.myStatus).toBe('None');
    expect(user1Post.extendedLikesInfo.newestLikes).toHaveLength(0);

    // Проверяем состояние от пользователя 2
    const user2Response = await userAuth(userTokens[1])
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    const user2Post = user2Response.body;

    expect(user2Post.extendedLikesInfo.likesCount).toBe(0);
    expect(user2Post.extendedLikesInfo.dislikesCount).toBe(1);
    expect(user2Post.extendedLikesInfo.myStatus).toBe('Dislike');
    expect(user2Post.extendedLikesInfo.newestLikes).toHaveLength(0);
  });
});
