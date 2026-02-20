import * as supertest from 'supertest';
import express from 'express';
import { setupApp } from '../../../setup-app';
import { HttpStatus } from '../../../core/types/http-statuses';
import { BlogInputDto } from '../../../domain/blog/dto/blog.input-dto';
import { BLOGS_PATH } from '../../../core/paths/paths';
import { runDB, stopDb } from '../../../db/mongo.db';
import { SETTINGS } from '../../../core/settings/settings';
import { clearDb } from '../../../core/utils/clear-db';
import { log } from 'node:console';

describe('Blogs API', () => {
  const app = express();
  setupApp(app);

  const testBlogData: BlogInputDto = {
    name: 'Valentin Blog',
    description: 'test 123',
    websiteUrl:
      'https://samurai.it-incubator.io/lessons/lessons/view/63076d36e5fc0a055534e417',
  };

  function auth() {
    return supertest.agent(app).auth('admin', 'qwerty', { type: 'basic' });
  }

  beforeAll(async () => {
    await runDB(SETTINGS.MONGO_URL);
    await clearDb(app);
  }, 15000);

  afterAll(async () => {
    await stopDb();
  });

  it('should create blog; POST blog', async () => {
    await auth().post(BLOGS_PATH).send(testBlogData).expect(HttpStatus.Created);
  });

  it('should return error with empty name and website; POST blog', async () => {
    const returnData = await auth()
      .post(BLOGS_PATH)
      .send({ name: '    ', websiteUrl: '', description: 'description' })
      .expect(HttpStatus.BadRequest);

    expect(returnData.body.errorsMessages).toEqual([
      { message: expect.any(String), field: 'name' },
      { message: expect.any(String), field: 'websiteUrl' },
    ]);
  });

  it('should fail create blog with broken website; POST blog', async () => {
    const newPost: BlogInputDto = {
      name: 'Feodor',
      description: 'test 123',
      websiteUrl: '//123',
    };

    await auth().post(BLOGS_PATH).send(newPost).expect(HttpStatus.BadRequest);
  });

  it('should return drivers list; GET /drivers', async () => {
    await auth()
      .post(BLOGS_PATH)
      .send({ ...testBlogData, name: 'Another Driver' })
      .expect(HttpStatus.Created);

    await auth()
      .post(BLOGS_PATH)
      .send({ ...testBlogData, name: 'Another Driver2' })
      .expect(HttpStatus.Created);

    const driverListResponse = await auth()
      .get(BLOGS_PATH)
      .expect(HttpStatus.Ok);

    expect(driverListResponse.body).toBeInstanceOf(Array);
    expect(driverListResponse.body.length).toBeGreaterThanOrEqual(2);
  });

  it('should return Blog by id; GET /blogs/:id', async () => {
    const createResponse = await auth()
      .post(BLOGS_PATH)
      .send({ ...testBlogData, name: 'Another Blog' })
      .expect(HttpStatus.Created);

    const getResponse = await auth()
      .get(`${BLOGS_PATH}/${createResponse.body.id}`)
      .expect(HttpStatus.Ok);

    expect(getResponse.body).toEqual({
      ...createResponse.body,
      id: expect.any(String),
    });
  });


it('should create blog and return full model with createdAt and isMembership; POST -> GET', async () => {
  const newBlogData: BlogInputDto = {
    name: 'Full Model Blog',
    description: 'Complete fields test',
    websiteUrl: 'https://example.com',
  };

  const createResponse = await auth()
    .post(BLOGS_PATH)
    .send(newBlogData)
    .expect(HttpStatus.Created);

    log(createResponse.body);
    
  expect(createResponse.body).toEqual({
    id: expect.any(String),
    name: newBlogData.name,
    description: newBlogData.description,
    websiteUrl: newBlogData.websiteUrl,
    isMembership: false,
    createdAt: expect.stringMatching(
      /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
    ),
  });

  // Шаг 2: Проверяем через GET /blogs/:id
  const getResponse = await auth()
    .get(`${BLOGS_PATH}/${createResponse.body.id}`)
    .expect(HttpStatus.Ok);

  expect(getResponse.body).toEqual(createResponse.body); // полное совпадение
});

it('should create blog and return full model with createdAt and isMembership; POST -> GET', async () => {
  const newBlogData: BlogInputDto = {
    name: 'Full Model Blog',
    description: 'Complete fields test',
    websiteUrl: 'https://example.com',
  };

  const createResponse = await auth()
    .post(BLOGS_PATH)
    .send(newBlogData)
    .expect(HttpStatus.Created);

  // Проверяем структуру ответа после создания
  expect(createResponse.body).toEqual({
    id: expect.any(String),
    name: newBlogData.name,
    description: newBlogData.description,
    websiteUrl: newBlogData.websiteUrl,
    isMembership: false,
    createdAt: expect.stringMatching(
      /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/,
    ),
  });

  // Проверяем через GET
  const getResponse = await auth()
    .get(`${BLOGS_PATH}/${createResponse.body.id}`)
    .expect(HttpStatus.Ok);

  expect(getResponse.body).toEqual(createResponse.body); // полное совпадение
});

it('should return blog by id with full model; GET /blogs/:id', async () => {
  const newBlogData = testBlogData

  // Шаг 1: Создаём блог
  const createResponse = await auth()
    .post(BLOGS_PATH)
    .send(newBlogData)
    .expect(HttpStatus.Created);

  expect(createResponse.body).toEqual({
    id: expect.any(String),
    name: newBlogData.name,
    description: newBlogData.description,
    websiteUrl: newBlogData.websiteUrl,
    isMembership: false,
    createdAt: expect.stringMatching(
      /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/,
    ),
  });

  // Шаг 2: Получаем блог по ID
  const getResponse = await auth()
    .get(`${BLOGS_PATH}/${createResponse.body.id}`)
    .expect(HttpStatus.Ok);

  // Проверяем, что GET возвращает те же данные
  expect(getResponse.body).toEqual({
    id: createResponse.body.id,
    name: newBlogData.name,
    description: newBlogData.description,
    websiteUrl: newBlogData.websiteUrl,
    isMembership: false,
    createdAt: expect.stringMatching(
      /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/,
    ),
  });

  // Полное совпадение с POST-ответом
  expect(getResponse.body).toStrictEqual(createResponse.body);
});
  
});
