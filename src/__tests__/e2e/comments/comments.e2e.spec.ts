// src/__tests__/e2e/comments/comments.e2e.spec.ts

import supertest from 'supertest';
import express from 'express';
import { setupApp } from '../../../setup-app';
import { HttpStatus } from '../../../core/types/http-statuses';
import { BlogInputDto } from '../../../domain/blog/dto/blog.input-dto';
import { PostInputDto } from '../../../domain/posts/dto/post.input-dto';
import { BLOGS_PATH, POSTS_PATH } from '../../../core/paths/paths';
import { runDB, stopDb } from '../../../db/mongo.db';
import { SETTINGS } from '../../../core/settings/settings';
import { clearDb } from '../../../core/utils/clear-db';
import { CommentInputDto } from '../../../domain/comments/types';

const createdAtRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

describe('Comments API E2E', () => {
  const app = express();
  setupApp(app);

  let accessToken: string; // будет заполнен в beforeEach

  const testUserData = {
    login: 'testuser',
    email: 'testuser@example.com',
    password: 'qwerty123',
  };

  const testBlogData: BlogInputDto = {
    name: 'Test Blog',
    description: 'This is a test blog',
    websiteUrl: 'https://example.com',
  };

  const testPostData: Omit<PostInputDto, 'blogId'> = {
    title: 'Test Post',
    shortDescription: 'Short desc',
    content: 'Full post content here',
  };

  const testCommentData: CommentInputDto = {
    content: 'This is a test comment that will be deleted.',
  };

  beforeAll(async () => {
    await runDB(SETTINGS.MONGO_URL);
  }, 15000);

  beforeEach(async () => {
    await clearDb(app);

    // Шаг 1: Создаём пользователя (через базовую авторизацию)
    await supertest(app)
      .post('/users')
      .auth('admin', 'qwerty', { type: 'basic' })
      .send(testUserData)
      .expect(HttpStatus.Created);

    // Шаг 2: Логинимся и получаем токен
    const loginRes = await supertest(app)
      .post('/auth/login')
      .send({
        loginOrEmail: testUserData.login,
        password: testUserData.password,
      })
      .expect(HttpStatus.Ok);

    expect(loginRes.body).toHaveProperty('accessToken');
    accessToken = loginRes.body.accessToken; // сохраняем токен
  }, 10000);

  afterAll(async () => {
    await stopDb();
  }, 10000);

  describe('DELETE /comments/:id', () => {
    let blogId: string;
    let postId: string;
    let commentId: string;

    beforeEach(async () => {
      // Создаём блог
      const blogRes = await supertest(app)
        .post(BLOGS_PATH)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send(testBlogData)
        .expect(HttpStatus.Created);
      blogId = blogRes.body.id;

      // Создаём пост
      const postRes = await supertest(app)
        .post(POSTS_PATH)
        .auth('admin', 'qwerty', { type: 'basic' })
        .send({ ...testPostData, blogId })
        .expect(HttpStatus.Created);
      postId = postRes.body.id;

      // Создаём комментарий
      const commentRes = await supertest(app)
        .post(`${POSTS_PATH}/${postId}/comments`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(testCommentData)
        .expect(HttpStatus.Created);
      commentId = commentRes.body.id;
    });

    it('should delete comment by id and return 204; subsequent GET should return 404', async () => {
      // Удаление
      await supertest(app)
        .delete(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.NoContent);
console.log('accessToken >>>', accessToken);

      // Проверка, что больше не существует
      await supertest(app)
        .get(`/comments/${commentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.NotFound);
    });

    it('should return 404 when trying to delete non-existent comment', async () => {
      const nonExistentId = '63189b06003380064c4193be';

      await supertest(app)
        .delete(`/comments/${nonExistentId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.NotFound);
    });
  });
});