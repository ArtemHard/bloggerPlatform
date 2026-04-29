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

describe('Posts List With Likes API', () => {
  const app = express();
  setupApp(app);

  let blogId: string;
  let postIds: string[] = [];
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

    // Создаем 6 постов
    for (let i = 1; i <= 6; i++) {
      const postResponse = await auth()
        .post(POSTS_PATH)
        .send({
          title: `Test Post ${i}`,
          shortDescription: `Test Short Description ${i}`,
          content: `Test Content ${i}`,
          blogId: blogId,
        })
        .expect(HttpStatus.Created);

      postIds.push(postResponse.body.id);
    }

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

    // Настраиваем лайки и дизлайки согласно тест логам:
    // post 1: like by user 1, user 2
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postIds[0]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postIds[0]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    // post 2: like by user 2, user 3
    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postIds[1]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    await userAuth(userTokens[2])
      .put(`${POSTS_PATH}/${postIds[1]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    // post 3: dislike by user 1
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postIds[2]}/like-status`)
      .send({ likeStatus: 'Dislike' })
      .expect(HttpStatus.NoContent);

    // post 4: like by user 1, user 4, user 2, user 3
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postIds[3]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    await userAuth(userTokens[3])
      .put(`${POSTS_PATH}/${postIds[3]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postIds[3]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    await userAuth(userTokens[2])
      .put(`${POSTS_PATH}/${postIds[3]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    // post 5: like by user 2, dislike by user 3
    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postIds[4]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    await userAuth(userTokens[2])
      .put(`${POSTS_PATH}/${postIds[4]}/like-status`)
      .send({ likeStatus: 'Dislike' })
      .expect(HttpStatus.NoContent);

    // post 6: like by user 1, dislike by user 2
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postIds[5]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postIds[5]}/like-status`)
      .send({ likeStatus: 'Dislike' })
      .expect(HttpStatus.NoContent);
  });

  afterAll(async () => {
    await stopDb();
  });

  it('should return posts with correct likes info for user 1; GET /posts', async () => {
    const response = await userAuth(userTokens[0])
      .get(POSTS_PATH)
      .expect(HttpStatus.Ok);

    const postsData = response.body;

    // Проверяем структуру ответа
    expect(postsData).toHaveProperty('pagesCount');
    expect(postsData).toHaveProperty('page');
    expect(postsData).toHaveProperty('pageSize');
    expect(postsData).toHaveProperty('totalCount');
    expect(postsData).toHaveProperty('items');
    expect(Array.isArray(postsData.items)).toBe(true);
    expect(postsData.items).toHaveLength(6);

    const posts = postsData.items;

    // Проверяем каждый пост
    // post 1: like by user 1, user 2 -> user1 видит Like
    const post1 = posts.find((p: any) => p.id === postIds[0]);
    expect(post1.extendedLikesInfo.likesCount).toBe(2);
    expect(post1.extendedLikesInfo.dislikesCount).toBe(0);
    expect(post1.extendedLikesInfo.myStatus).toBe('Like');
    expect(post1.extendedLikesInfo.newestLikes).toHaveLength(2);

    // post 2: like by user 2, user 3 -> user1 видит None
    const post2 = posts.find((p: any) => p.id === postIds[1]);
    expect(post2.extendedLikesInfo.likesCount).toBe(2);
    expect(post2.extendedLikesInfo.dislikesCount).toBe(0);
    expect(post2.extendedLikesInfo.myStatus).toBe('None');
    expect(post2.extendedLikesInfo.newestLikes).toHaveLength(2);

    // post 3: dislike by user 1 -> user1 видит Dislike
    const post3 = posts.find((p: any) => p.id === postIds[2]);
    expect(post3.extendedLikesInfo.likesCount).toBe(0);
    expect(post3.extendedLikesInfo.dislikesCount).toBe(1);
    expect(post3.extendedLikesInfo.myStatus).toBe('Dislike');
    expect(post3.extendedLikesInfo.newestLikes).toHaveLength(0);

    // post 4: like by user 1, user 4, user 2, user 3 -> user1 видит Like
    const post4 = posts.find((p: any) => p.id === postIds[3]);
    expect(post4.extendedLikesInfo.likesCount).toBe(4);
    expect(post4.extendedLikesInfo.dislikesCount).toBe(0);
    expect(post4.extendedLikesInfo.myStatus).toBe('Like');
    expect(post4.extendedLikesInfo.newestLikes).toHaveLength(4);

    // post 5: like by user 2, dislike by user 3 -> user1 видит None
    const post5 = posts.find((p: any) => p.id === postIds[4]);
    expect(post5.extendedLikesInfo.likesCount).toBe(1);
    expect(post5.extendedLikesInfo.dislikesCount).toBe(1);
    expect(post5.extendedLikesInfo.myStatus).toBe('None');
    expect(post5.extendedLikesInfo.newestLikes).toHaveLength(1);

    // post 6: like by user 1, dislike by user 2 -> user1 видит Like
    const post6 = posts.find((p: any) => p.id === postIds[5]);
    expect(post6.extendedLikesInfo.likesCount).toBe(1);
    expect(post6.extendedLikesInfo.dislikesCount).toBe(1);
    expect(post6.extendedLikesInfo.myStatus).toBe('Like');
    expect(post6.extendedLikesInfo.newestLikes).toHaveLength(1);

    // Проверяем сортировку newestLikes для всех постов
    for (const post of posts) {
      const newestLikes = post.extendedLikesInfo.newestLikes;
      if (newestLikes.length > 1) {
        for (let i = 0; i < newestLikes.length - 1; i++) {
          const currentDate = new Date(newestLikes[i].addedAt);
          const nextDate = new Date(newestLikes[i + 1].addedAt);
          expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
        }
      }
    }
  });

  it('should return posts with pagination; GET /posts', async () => {
    // Тест пагинации
    const page1Response = await userAuth(userTokens[0])
      .get(POSTS_PATH)
      .query({ pageSize: 3, pageNumber: 1 })
      .expect(HttpStatus.Ok);

    const page1Data = page1Response.body;
    expect(page1Data.pagesCount).toBe(2);
    expect(page1Data.page).toBe(1);
    expect(page1Data.pageSize).toBe(3);
    expect(page1Data.totalCount).toBe(6);
    expect(page1Data.items).toHaveLength(3);

    const page2Response = await userAuth(userTokens[0])
      .get(POSTS_PATH)
      .query({ pageSize: 3, pageNumber: 2 })
      .expect(HttpStatus.Ok);

    const page2Data = page2Response.body;
    expect(page2Data.pagesCount).toBe(2);
    expect(page2Data.page).toBe(2);
    expect(page2Data.pageSize).toBe(3);
    expect(page2Data.totalCount).toBe(6);
    expect(page2Data.items).toHaveLength(3);

    // Проверяем что посты не дублируются
    const page1Ids = page1Data.items.map((item: any) => item.id);
    const page2Ids = page2Data.items.map((item: any) => item.id);
    const allIds = [...page1Ids, ...page2Ids];
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(6);
  });

  it('should return posts with sorting by createdAt; GET /posts', async () => {
    const response = await userAuth(userTokens[0])
      .get(POSTS_PATH)
      .query({ sortBy: 'createdAt', sortDirection: 'desc' })
      .expect(HttpStatus.Ok);

    const posts = response.body.items;

    // Проверяем сортировку по убыванию createdAt
    for (let i = 0; i < posts.length - 1; i++) {
      const currentDate = new Date(posts[i].createdAt);
      const nextDate = new Date(posts[i + 1].createdAt);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }
  });

  it('should return posts with correct likes info for different users; GET /posts', async () => {
    // Проверяем для пользователя 2
    const user2Response = await userAuth(userTokens[1])
      .get(POSTS_PATH)
      .expect(HttpStatus.Ok);

    const user2Posts = user2Response.body.items;
    const user2Post1 = user2Posts.find((p: any) => p.id === postIds[0]);
    
    // post 1: like by user 1, user 2 -> user2 видит Like
    expect(user2Post1.extendedLikesInfo.myStatus).toBe('Like');

    // Проверяем для пользователя 3
    const user3Response = await userAuth(userTokens[2])
      .get(POSTS_PATH)
      .expect(HttpStatus.Ok);

    const user3Posts = user3Response.body.items;
    const user3Post1 = user3Posts.find((p: any) => p.id === postIds[0]);
    
    // post 1: like by user 1, user 2 -> user3 видит None
    expect(user3Post1.extendedLikesInfo.myStatus).toBe('None');

    // Проверяем для пользователя 4
    const user4Response = await userAuth(userTokens[3])
      .get(POSTS_PATH)
      .expect(HttpStatus.Ok);

    const user4Posts = user4Response.body.items;
    const user4Post1 = user4Posts.find((p: any) => p.id === postIds[0]);
    
    // post 1: like by user 1, user 2 -> user4 видит None
    expect(user4Post1.extendedLikesInfo.myStatus).toBe('None');
  });
});
