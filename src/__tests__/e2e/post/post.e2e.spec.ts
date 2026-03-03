import * as supertest from 'supertest';
import express from 'express';
import { setupApp } from '../../../setup-app';
import { HttpStatus } from '../../../core/types/http-statuses';
import { BlogInputDto } from '../../../domain/blog/dto/blog.input-dto';
import { BLOGS_PATH, POSTS_PATH } from '../../../core/paths/paths';
import { PostInputDto } from '../../../domain/posts/dto/post.input-dto';
import { Blog } from '../../../domain/blog/validation/types/blog';
import { runDB, stopDb } from '../../../db/mongo.db';
import { SETTINGS } from '../../../core/settings/settings';
import { clearDb } from '../../../core/utils/clear-db';

const createdAtRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

describe('Post API', () => {
  let blog: Blog & { id: string } = {} as Blog & { id: string };
  let postId = '';

  const app = express();
  setupApp(app);

  function auth() {
    return supertest.agent(app).auth('admin', 'qwerty', { type: 'basic' });
  }

  const testBlogData: BlogInputDto = {
    name: 'Valentin Blog',
    description: 'test 123',
    websiteUrl: 'https://samurai.it-incubator.io/lessons/lessons/view/63076d36e5fc0a055534e417',
  };

  const testPostData: Omit<PostInputDto, 'blogId'> = {
    title: 'Valentin Blog',
    shortDescription: 'test 123',
    content: 'https://samurai.it-incubator.io/lessons/lessons/view/63076d36e5fc0a055534e417',
  };

  beforeAll(async () => {
    await runDB(SETTINGS.MONGO_URL);
    await clearDb(app);
    await auth().delete('/testing/all-data').expect(HttpStatus.NoContent);

    const { body } = await auth()
      .post(BLOGS_PATH)
      .send(testBlogData)
      .expect(HttpStatus.Created);

    blog.id = body.id;
    blog.name = body.name;
  }, 15000);

  afterAll(async () => {
    await stopDb();
  });

  // Основной тест: создание поста + проверка createdAt
  it('should create post for blog and return createdAt field; POST /posts', async () => {
    const createResponse = await auth()
      .post(POSTS_PATH)
      .send({ ...testPostData, blogId: blog.id })
      .expect(HttpStatus.Created);

    const createdPost = createResponse.body;

    // Сохраняем ID для дальнейших тестов
    postId = createdPost.id;

    // Проверяем структуру и наличие полей
    expect(createdPost).toEqual({
      id: expect.any(String),
      title: testPostData.title,
      shortDescription: testPostData.shortDescription,
      content: testPostData.content,
      blogId: blog.id,
      blogName: blog.name,
      createdAt: expect.stringMatching(createdAtRegex),
    });

    // Дополнительно: проверим, что дата не в будущем
    const createdAtDate = new Date(createdPost.createdAt);
    expect(createdAtDate.getTime()).toBeLessThanOrEqual(Date.now() + 1000);
  });

  // Проверка получения поста по ID
  it('should return created post by id with correct createdAt; GET /posts/:id', async () => {
    const getResponse = await auth()
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    const post = getResponse.body;

    expect(post).toEqual({
      id: postId,
      title: testPostData.title,
      shortDescription: testPostData.shortDescription,
      content: testPostData.content,
      blogId: blog.id,
      blogName: blog.name,
      createdAt: expect.stringMatching(createdAtRegex),
    });
  });

  // Проверка списка постов
  it('should return list of posts with createdAt; GET /posts', async () => {
    await auth()
      .post(POSTS_PATH)
      .send({ ...testPostData, title: 'Another Post', blogId: blog.id })
      .expect(HttpStatus.Created);

    const response = await auth().get(POSTS_PATH).expect(HttpStatus.Ok);
    const posts = response.body.items;

    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThanOrEqual(2);

    for (const post of posts) {
      expect(post).toHaveProperty('createdAt');
      expect(typeof post.createdAt).toBe('string');
      expect(post.createdAt).toMatch(createdAtRegex);
    }
  });
});

