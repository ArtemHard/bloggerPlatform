import { Router } from 'express';

import { getAllBlogsHandler } from './handlers/get-all-blogs.handler';
import { createBlogHandler } from './handlers/create-blog.handler';
import { idValidation } from '../../../core/middlewars/validatinos';
import { getBlogHandler } from './handlers/get-blog.handler';
import { inputValidationResultMiddleware } from '../../../core/middlewars/input-validtion-result.middleware';
import { updateBlogHandler } from './handlers/update-blog.handler';
import { deleteBlogHandler } from './handlers/delete-blog.handler';
import { superAdminGuardMiddleware } from '../../../middlewares/super-admin.guard-middleware';
import { paginationAndSortingValidation } from '../../../core/middlewars/validation/query-pagination-sorting.validation-middleware';
import { PostSortField } from '../../posts/routers/input/post-sort-field';
import { getBlogPostsListHandler } from './handlers/get-blog-posts-list.handler';
import { createBlogPostHandler } from './handlers/create-blog-post-handler';
import { BlogSortField } from './input/blog-sort-field';
import { baseAuthGuard } from '../../../auth/api/guards/base.auth.guard';

export const blogRouter = Router({});

blogRouter
  //   .use(superAdminGuardMiddleware)
  .get(
    '',
    paginationAndSortingValidation(BlogSortField),
    inputValidationResultMiddleware,
    //@ts-expect-error  уже используете paginationAndSortingValidation перед хэндлером, и он гарантированно парсит поля в числа
    getAllBlogsHandler,
  )
  .get('/:id', idValidation, inputValidationResultMiddleware, getBlogHandler)
  .post('', baseAuthGuard, createBlogHandler)
  .put(
    '/:id',
    idValidation,
    superAdminGuardMiddleware,
    updateBlogHandler,
  )
  .delete(
    '/:id',
    superAdminGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    deleteBlogHandler,
  )
  .get(
    '/:id/posts',
    idValidation,
    paginationAndSortingValidation(PostSortField),
    inputValidationResultMiddleware,
    //@ts-expect-error  уже используете paginationAndSortingValidation перед хэндлером, и он гарантированно парсит поля в числа
    getBlogPostsListHandler,
  )
  .post(
    '/:id/posts',
    superAdminGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    createBlogPostHandler,
  );
