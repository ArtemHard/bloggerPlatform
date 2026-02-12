import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../setup-app';
import { HttpStatus } from '../../../core/types/http-statuses';
import { BlogInputDto } from '../../../domain/blog/dto/blog.input-dto';
import { BLOGS_PATH, POSTS_PATH } from '../../../core/paths/paths';
import { PostInputDto } from '../../../domain/posts/dto/post.input-dto';
import { Blog } from '../../../domain/blog/validation/types/blog';

describe('Driver API', () => {
  let blog: Blog = {} as Blog;
  let postid = '';

  const app = express();
  setupApp(app);

  const testBlogData: BlogInputDto = {
    name: 'Valentin Blog',
    description: 'test 123',
    websiteUrl:
      'https://samurai.it-incubator.io/lessons/lessons/view/63076d36e5fc0a055534e417',
  };

  const testPostData: Omit<PostInputDto, 'blogId'> = {
    title: 'Valentin Blog',
    shortDescription: 'test 123',
    content:
      'https://samurai.it-incubator.io/lessons/lessons/view/63076d36e5fc0a055534e417',
  };

  beforeAll(async () => {
    await request(app).delete('/testing/all-data').expect(HttpStatus.NoContent);

    const { body } = await request(app)
      .post(BLOGS_PATH)
      .send(testBlogData)
      .expect(HttpStatus.Created);

    blog.id = body.id;
    blog.name = body.name;

    const { body: postResponse } = await request(app)
      .post(POSTS_PATH)
      .send({ ...testPostData, blogId: blog.id })
      .expect(HttpStatus.Created);
    postid = postResponse.id;
  });

  it('should create post for blog; POST post', async () => {
    await request(app)
      .post(POSTS_PATH)
      .send({ ...testPostData, blogId: blog.id })
      .expect(HttpStatus.Created);
  });

  // it.skip('should fail create blog with broken website; POST blog', async () => {
  //   const newPost: BlogInputDto = {
  //     name: 'Feodor',
  //     description: 'test 123',
  //     websiteUrl: '//123',
  //   };

  //   await request(app)
  //     .post(BLOGS_PATH)
  //     .send(newPost)
  //     .expect(HttpStatus.BadRequest);
  // });
  it('should return post list; GET /posts', async () => {
    await request(app)
      .post(POSTS_PATH)
      .send({ ...testPostData, name: 'Another Driver', blogId: blog.id })
      .expect(HttpStatus.Created);

    await request(app)
      .post(POSTS_PATH)
      .send({ ...testPostData, name: 'Another Driver2', blogId: blog.id })
      .expect(HttpStatus.Created);

    const driverListResponse = await request(app)
      .get(POSTS_PATH)
      .expect(HttpStatus.Ok);

    expect(driverListResponse.body).toBeInstanceOf(Array);

    expect(driverListResponse.body.length).toBeGreaterThanOrEqual(2);
  });

  it('should return post by id; GET /blogs/:id', async () => {
    const getResponse = await request(app)
      .get(`${POSTS_PATH}/${postid}`)
      .expect(HttpStatus.Ok);

    expect(getResponse.body).toEqual({
      ...testPostData,
      blogId: blog.id,
      blogName: blog.name,
      id: expect.any(String),
    });
  });
});
