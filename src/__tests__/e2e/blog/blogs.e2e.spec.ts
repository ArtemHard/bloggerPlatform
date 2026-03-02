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
import { ObjectId } from 'mongodb';
import { PostSortField } from '../../../domain/posts/routers/input/post-sort-field';

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
  }, 10000);

  describe('basic tests', () => {
    it('should create blog; POST blog', async () => {
      await auth()
        .post(BLOGS_PATH)
        .send(testBlogData)
        .expect(HttpStatus.Created);
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

    it('should return blogs list; GET /blogs', async () => {
      await auth()
        .post(BLOGS_PATH)
        .send({ ...testBlogData, name: 'Another Blog' })
        .expect(HttpStatus.Created);

      await auth()
        .post(BLOGS_PATH)
        .send({ ...testBlogData, name: 'Another Blog2' })
        .expect(HttpStatus.Created);

      const blogListResponse = await auth()
        .get(BLOGS_PATH)
        .expect(HttpStatus.Ok);

      expect(blogListResponse.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: [
          {
            id: expect.any(String),
            name: 'Another Blog2',
            description: 'test 123',
            websiteUrl:
              'https://samurai.it-incubator.io/lessons/lessons/view/63076d36e5fc0a055534e417',
            isMembership: false,
            createdAt: expect.stringMatching(
              /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/,
            ),
          },
          {
            id: expect.any(String),
            name: 'Another Blog',
            description: 'test 123',
            websiteUrl:
              'https://samurai.it-incubator.io/lessons/lessons/view/63076d36e5fc0a055534e417',
            isMembership: false,
            createdAt: expect.stringMatching(
              /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
            ),
          },
          {
            id: expect.any(String),
            name: 'Valentin Blog',
            description: 'test 123',
            websiteUrl:
              'https://samurai.it-incubator.io/lessons/lessons/view/63076d36e5fc0a055534e417',
            isMembership: false,
            createdAt: expect.stringMatching(
              /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/,
            ),
          },
        ],
      });

      expect(blogListResponse.body.items.length).toBeGreaterThanOrEqual(2);
    });

     it('should return blogs list; GET /blogs with searchNameTerm', async () => {
      await auth()
        .post(BLOGS_PATH)
        .send({ ...testBlogData, name: 'Another Blog' })
        .expect(HttpStatus.Created);

      await auth()
        .post(BLOGS_PATH)
        .send({ ...testBlogData, name: 'SearchTerm' })
        .expect(HttpStatus.Created);

      const blogListResponse = await auth()
        .get(BLOGS_PATH)
        .query({ searchNameTerm: 'SearchTerm' })
        .expect(HttpStatus.Ok);

      expect(blogListResponse.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            name: 'SearchTerm',
            description: 'test 123',
            websiteUrl:
              'https://samurai.it-incubator.io/lessons/lessons/view/63076d36e5fc0a055534e417',
            isMembership: false,
            createdAt: expect.stringMatching(
              /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/,
            ),
          }
        ],
      });

      expect(blogListResponse.body.items.length).toBeGreaterThanOrEqual(1);
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
      const newBlogData = testBlogData;

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

  describe('GET /blogs/:id/posts', () => {
    const newBlog = {
      name: 'TestBlgForPosts',
      description: 'Blog used to test posts fetching',
      websiteUrl: 'https://example.com',
    };

    const firstPost = {
      title: 'First Post',
      shortDescription: 'Short desc 1',
      content: 'Full content of the first post',
    };

    const secondPost = {
      title: 'Second Post',
      shortDescription: 'Short desc 2',
      content: 'Full content of the second post',
    };

    it('should return 404 if blog does not exist', async () => {
      const nonExistentId = new ObjectId().toHexString();

      await auth()
        .get(`${BLOGS_PATH}/${nonExistentId}/posts`)
        .expect(HttpStatus.NotFound);
    });

    it('should return paginated list of posts for existing blog', async () => {
      // Шаг 1: Создаём блог
      const blogResponse = await auth()
        .post(BLOGS_PATH)
        .send(newBlog)
        .expect(HttpStatus.Created);
      const blogId = blogResponse.body.id;

      // Шаг 2: Создаём два поста в этом блоге
      const post1 = await auth()
        .post(`/posts`)
        .send({ ...firstPost, blogId })
        .expect(HttpStatus.Created);
      const post2 = await auth()
        .post(`/posts`)
        .send({ ...secondPost, blogId })
        .expect(HttpStatus.Created);
      // Шаг 3: Получаем посты блога
      const postsResponse = await auth()
        .get(`${BLOGS_PATH}/${blogId}/posts`)
        .expect(HttpStatus.Ok);
      expect(postsResponse.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: expect.arrayContaining([
          expect.objectContaining({
            id: post2.body.id, // последний пост — первый в списке (по createdAt desc)
            title: secondPost.title,
            shortDescription: secondPost.shortDescription,
            content: secondPost.content,
            blogId,
            blogName: newBlog.name,
            createdAt: expect.any(String),
          }),
          expect.objectContaining({
            id: post1.body.id,
            title: firstPost.title,
            shortDescription: firstPost.shortDescription,
            content: firstPost.content,
            blogId,
            blogName: newBlog.name,
            createdAt: expect.any(String),
          }),
        ]),
      });

      // Проверяем порядок: самый свежий пост — первый
      const items = postsResponse.body.items;
      // Проверяем порядок: самый свежий пост — первый
      expect(new Date(items[0].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(items[1].createdAt).getTime(),
      );
    }, 15000);

    it('should apply pagination and sorting parameters', async () => {
      // Создаём блог
      const blogResponse = await auth()
        .post(BLOGS_PATH)
        .send({
          name: 'Pagin Blog',
          description: 'For testing pagination',
          websiteUrl: 'https://example.com',
        })
        .expect(HttpStatus.Created);

      const blogId = blogResponse.body.id;

      // Создаём 3 поста
      const titles = ['A First', 'B Second', 'C Third'];
      const posts = [];

      for (const title of titles) {
        const res = await auth()
          .post('/posts')
          .send({
            title,
            shortDescription: 'desc',
            content: 'content',
            blogId,
          })
          .expect(HttpStatus.Created);
        posts.push(res.body);
      }

      // Сортируем по createdAt desc (по умолчанию)
      const res = await auth()
        .get(`${BLOGS_PATH}/${blogId}/posts`)
        .query({
          pageNumber: 1,
          pageSize: 2,
          sortBy: PostSortField.createdAt,
          sortDirection: 'desc',
        })
        .expect(HttpStatus.Ok);

      expect(res.body).toEqual({
        pagesCount: expect.any(Number),
        page: expect.any(Number),
        pageSize: expect.any(Number),
        totalCount: expect.any(Number), // ← было: totalItems
        items: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            shortDescription: expect.any(String),
            content: expect.any(String),
            blogId: expect.any(String),
            blogName: expect.any(String),
            createdAt: expect.stringMatching(
              /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
            ),
          }),
        ]),
      });

      // Проверяем порядок: по убыванию createdAt
      const items = res.body.items;
      for (let i = 0; i < items.length - 1; i++) {
        const current = new Date(items[i].createdAt).getTime();
        const next = new Date(items[i + 1].createdAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }

      // Проверяем пагинацию: pageSize = 2 → должно быть 2 элемента на странице
      expect(items.length).toBe(2);
    });
  });

  describe('POST /blogs/:id/posts', () => {
    it('should create a post in the specified blog; POST /blogs/:id/posts', async () => {
      // Шаг 1: Создаём блог
      const blogResponse = await auth()
        .post(BLOGS_PATH)
        .send({
          name: 'Bg Creation',
          description: 'Used to test post creation via blog route',
          websiteUrl: 'https://example.com',
        })
        .expect(HttpStatus.Created);

      const blogId = blogResponse.body.id;
      const blogName = blogResponse.body.name;

      // Шаг 2: Данные для поста (без blogId — он берётся из URL)
      const newPostData = {
        title: 'New Post Title',
        shortDescription: 'Short description here',
        content: 'Full content of the new post',
      };
      log('blogId >>>>', blogId);
      // Шаг 3: Отправляем POST запрос на создание поста в блоге
      const postResponse = await auth()
        .post(`${BLOGS_PATH}/${blogId}/posts`)
        .send(newPostData)
        .expect(HttpStatus.Created);

      log('postRESPONSE >>>>', postResponse);

      // Шаг 4: Проверяем структуру ответа
      expect(postResponse.body).toEqual({
        id: expect.any(String),
        title: newPostData.title,
        shortDescription: newPostData.shortDescription,
        content: newPostData.content,
        blogId: blogId,
        blogName: blogName,
        createdAt: expect.stringMatching(
          /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/,
        ),
      });

      // Опционально: проверяем, что пост действительно сохранён
      await auth()
        .get(`/posts/${postResponse.body.id}`)
        .expect(HttpStatus.Ok)
        .then((res) => {
          expect(res.body.id).toBe(postResponse.body.id);
          expect(res.body.blogId).toBe(blogId);
        });
    });
  });
});
