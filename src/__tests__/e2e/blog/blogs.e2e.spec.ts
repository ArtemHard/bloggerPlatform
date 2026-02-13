import * as supertest from 'supertest';
import express from 'express';
import { setupApp } from '../../../setup-app';
import { HttpStatus } from '../../../core/types/http-statuses';
import { BlogInputDto } from '../../../domain/blog/dto/blog.input-dto';
import { BLOGS_PATH } from '../../../core/paths/paths';

describe('Driver API', () => {
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
    await auth().delete('/testing/all-data').expect(HttpStatus.NoContent);
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
});
