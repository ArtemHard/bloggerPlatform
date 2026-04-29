import supertest from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { setupApp } from '../../../setup-app';
import { HttpStatus } from '../../../core/types/http-statuses';
import { POSTS_PATH, BLOGS_PATH } from '../../../core/paths/paths';
import { runDB, stopDb } from '../../../db/mongo.db';
import { SETTINGS } from '../../../core/settings/settings';
import { clearDb } from '../../../core/utils/clear-db';
import { PostViewModel } from '../../../domain/posts/types/posts';

// Mock rate limiting middleware to bypass rate limiting in tests
jest.mock('../../../core/middlewars/rate-limit.middleware', () => ({
  rateLimitMiddleware: async (_req: Request, _res: Response, next: NextFunction) => {
    next();
  },
}));

describe('Posts Likes API', () => {
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
    // Clear test data arrays
    postIds = [];
    userTokens = [];
    userIds = [];
    
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
  });

  afterAll(async () => {
    await stopDb();
  });

  it('should handle likes and dislikes for posts and return sorted newestLikes; GET /posts', async () => {
    // First test GET /posts without any likes to make sure the endpoint works
    const responseWithoutLikes = await userAuth(userTokens[0])
      .get(POSTS_PATH);

    if (responseWithoutLikes.status !== 200) {
      throw new Error(`GET /posts failed without likes: ${responseWithoutLikes.status}`);
    }

    // Настраиваем лайки и дизлайки согласно тест логам:
    // like post 1 by user 1, user 2
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postIds[0]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postIds[0]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    const responseAfterFirstLike = await userAuth(userTokens[0])
      .get(POSTS_PATH);
    
    if (responseAfterFirstLike.status !== 200) {
      throw new Error(`GET /posts failed after first like: ${responseAfterFirstLike.status}`);
    }

    // like post 2 by user 2, user 3
    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postIds[1]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    await userAuth(userTokens[2])
      .put(`${POSTS_PATH}/${postIds[1]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    // dislike post 3 by user 1
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postIds[2]}/like-status`)
      .send({ likeStatus: 'Dislike' })
      .expect(HttpStatus.NoContent);

    // like post 4 by user 1, user 4, user 2, user 3
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

    // like post 5 by user 2, dislike by user 3
    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postIds[4]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    await userAuth(userTokens[2])
      .put(`${POSTS_PATH}/${postIds[4]}/like-status`)
      .send({ likeStatus: 'Dislike' })
      .expect(HttpStatus.NoContent);

    // like post 6 by user 1, dislike by user 2
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postIds[5]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postIds[5]}/like-status`)
      .send({ likeStatus: 'Dislike' })
      .expect(HttpStatus.NoContent);

    // All likes and dislikes completed. Testing GET /posts with user 1

    // Get the posts by user 1 after all likes
    const response = await userAuth(userTokens[0])
      .get(POSTS_PATH);

    // Check if we got an error
    if (response.status !== 200) {
      throw new Error(`Expected 200, got ${response.status}`);
    }

    // Verify response structure
    expect(response.body).toHaveProperty('pagesCount');
    expect(response.body).toHaveProperty('page');
    expect(response.body).toHaveProperty('pageSize');
    expect(response.body).toHaveProperty('totalCount');
    expect(response.body).toHaveProperty('items');
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items).toHaveLength(6);

    // Verify post 1 (2 likes)
    const post1 = response.body.items.find((item: PostViewModel) => item.id === postIds[0]);
    expect(post1).toBeDefined();
    expect(post1.extendedLikesInfo.likesCount).toBe(2);
    expect(post1.extendedLikesInfo.dislikesCount).toBe(0);
    expect(post1.extendedLikesInfo.myStatus).toBe('Like');
    expect(post1.extendedLikesInfo.newestLikes).toHaveLength(2);

    // Verify post 2 (2 likes)
    const post2 = response.body.items.find((item: PostViewModel) => item.id === postIds[1]);
    expect(post2).toBeDefined();
    expect(post2.extendedLikesInfo.likesCount).toBe(2);
    expect(post2.extendedLikesInfo.dislikesCount).toBe(0);
    expect(post2.extendedLikesInfo.myStatus).toBe('None');
    expect(post2.extendedLikesInfo.newestLikes).toHaveLength(2);

    // Verify post 3 (1 dislike)
    const post3 = response.body.items.find((item: PostViewModel) => item.id === postIds[2]);
    expect(post3).toBeDefined();
    expect(post3.extendedLikesInfo.likesCount).toBe(0);
    expect(post3.extendedLikesInfo.dislikesCount).toBe(1);
    expect(post3.extendedLikesInfo.myStatus).toBe('Dislike');
    expect(post3.extendedLikesInfo.newestLikes).toHaveLength(0);

    // Verify post 4 (4 likes)
    const post4 = response.body.items.find((item: PostViewModel) => item.id === postIds[3]);
    expect(post4).toBeDefined();
    expect(post4.extendedLikesInfo.likesCount).toBe(4);
    expect(post4.extendedLikesInfo.dislikesCount).toBe(0);
    expect(post4.extendedLikesInfo.myStatus).toBe('Like');
    expect(post4.extendedLikesInfo.newestLikes).toHaveLength(3);

    // Verify newestLikes sorting (should be in descending order by addedAt)
    if (post4.extendedLikesInfo.newestLikes.length > 1) {
      const likes = post4.extendedLikesInfo.newestLikes;
      for (let i = 0; i < likes.length - 1; i++) {
        expect(new Date(likes[i].addedAt).getTime()).toBeGreaterThanOrEqual(new Date(likes[i + 1].addedAt).getTime());
      }
    }

    // Verify post 5 (1 like, 1 dislike)
    const post5 = response.body.items.find((item: PostViewModel) => item.id === postIds[4]);
    expect(post5).toBeDefined();
    expect(post5.extendedLikesInfo.likesCount).toBe(1);
    expect(post5.extendedLikesInfo.dislikesCount).toBe(1);
    expect(post5.extendedLikesInfo.myStatus).toBe('None');
    expect(post5.extendedLikesInfo.newestLikes).toHaveLength(1);

    // Verify post 6 (1 like, 1 dislike)
    const post6 = response.body.items.find((item: PostViewModel) => item.id === postIds[5]);
    expect(post6).toBeDefined();
    expect(post6.extendedLikesInfo.likesCount).toBe(1);
    expect(post6.extendedLikesInfo.dislikesCount).toBe(1);
    expect(post6.extendedLikesInfo.myStatus).toBe('Like');
    expect(post6.extendedLikesInfo.newestLikes).toHaveLength(1);

  });

  it('should handle likes and dislikes for posts and return sorted newestLikes; GET /blogs/:blogId/posts', async () => {
    // Настраиваем лайки и дизлайки согласно тест логам:
    // like post 1 by user 1, user 2
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postIds[0]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);
    

    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postIds[0]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    // like post 2 by user 2, user 3
    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postIds[1]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    await userAuth(userTokens[2])
      .put(`${POSTS_PATH}/${postIds[1]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    // dislike post 3 by user 1
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postIds[2]}/like-status`)
      .send({ likeStatus: 'Dislike' })
      .expect(HttpStatus.NoContent);

    // like post 4 by user 1, user 4, user 2, user 3
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

    // like post 5 by user 2, dislike by user 3
    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postIds[4]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    await userAuth(userTokens[2])
      .put(`${POSTS_PATH}/${postIds[4]}/like-status`)
      .send({ likeStatus: 'Dislike' })
      .expect(HttpStatus.NoContent);

    // like post 6 by user 1, dislike by user 2
    await userAuth(userTokens[0])
      .put(`${POSTS_PATH}/${postIds[5]}/like-status`)
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NoContent);

    await userAuth(userTokens[1])
      .put(`${POSTS_PATH}/${postIds[5]}/like-status`)
      .send({ likeStatus: 'Dislike' })
      .expect(HttpStatus.NoContent);

    // All likes and dislikes completed. Testing GET /blogs/:blogId/posts with user 1

    // Get the posts by blog ID as user 1
    const response = await userAuth(userTokens[0])
      .get(`${BLOGS_PATH}/${blogId}/posts`)
      .expect(HttpStatus.Ok);

    
    // Verify response structure
    expect(response.body).toHaveProperty('pagesCount');
    expect(response.body).toHaveProperty('page');
    expect(response.body).toHaveProperty('pageSize');
    expect(response.body).toHaveProperty('totalCount');
    expect(response.body).toHaveProperty('items');
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items).toHaveLength(6);

    // Verify post 1 (2 likes)
    const post1 = response.body.items.find((item: PostViewModel) => item.id === postIds[0]);
    expect(post1).toBeDefined();
    expect(post1.extendedLikesInfo.likesCount).toBe(2);
    expect(post1.extendedLikesInfo.dislikesCount).toBe(0);
    expect(post1.extendedLikesInfo.myStatus).toBe('Like');
    expect(post1.extendedLikesInfo.newestLikes).toHaveLength(2);

    // Verify post 2 (2 likes)
    const post2 = response.body.items.find((item: PostViewModel) => item.id === postIds[1]);
    expect(post2).toBeDefined();
    expect(post2.extendedLikesInfo.likesCount).toBe(2);
    expect(post2.extendedLikesInfo.dislikesCount).toBe(0);
    expect(post2.extendedLikesInfo.myStatus).toBe('None');
    expect(post2.extendedLikesInfo.newestLikes).toHaveLength(2);

    // Verify post 3 (1 dislike)
    const post3 = response.body.items.find((item: PostViewModel) => item.id === postIds[2]);
    expect(post3).toBeDefined();
    expect(post3.extendedLikesInfo.likesCount).toBe(0);
    expect(post3.extendedLikesInfo.dislikesCount).toBe(1);
    expect(post3.extendedLikesInfo.myStatus).toBe('Dislike');
    expect(post3.extendedLikesInfo.newestLikes).toHaveLength(0);

    // Verify post 4 (4 likes)
    const post4 = response.body.items.find((item: PostViewModel) => item.id === postIds[3]);
    expect(post4).toBeDefined();
    expect(post4.extendedLikesInfo.likesCount).toBe(4);
    expect(post4.extendedLikesInfo.dislikesCount).toBe(0);
    expect(post4.extendedLikesInfo.myStatus).toBe('Like');
    expect(post4.extendedLikesInfo.newestLikes).toHaveLength(3);

    // Verify newestLikes sorting (should be in descending order by addedAt)
    if (post4.extendedLikesInfo.newestLikes.length > 1) {
      const likes = post4.extendedLikesInfo.newestLikes;
      for (let i = 0; i < likes.length - 1; i++) {
        expect(new Date(likes[i].addedAt).getTime()).toBeGreaterThanOrEqual(new Date(likes[i + 1].addedAt).getTime());
      }
    }

    // Verify post 5 (1 like, 1 dislike)
    const post5 = response.body.items.find((item: PostViewModel) => item.id === postIds[4]);
    expect(post5).toBeDefined();
    expect(post5.extendedLikesInfo.likesCount).toBe(1);
    expect(post5.extendedLikesInfo.dislikesCount).toBe(1);
    expect(post5.extendedLikesInfo.myStatus).toBe('None');
    expect(post5.extendedLikesInfo.newestLikes).toHaveLength(1);

    // Verify post 6 (1 like, 1 dislike)
    const post6 = response.body.items.find((item: PostViewModel) => item.id === postIds[5]);
    expect(post6).toBeDefined();
    expect(post6.extendedLikesInfo.likesCount).toBe(1);
    expect(post6.extendedLikesInfo.dislikesCount).toBe(1);
    expect(post6.extendedLikesInfo.myStatus).toBe('Like');
    expect(post6.extendedLikesInfo.newestLikes).toHaveLength(1);

  }, 25000);
});
