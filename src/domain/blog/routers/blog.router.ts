import { Router } from 'express';

import { getAllBlogsHandler } from './handlers/get-all-blogs.handler';
import { createBlogHandler } from './handlers/create-blog.handler';
import { idValidation } from '../../../core/middlewars/validatinos';
import { getBlogHandler } from './handlers/get-blog.handler';
import { inputValidationResultMiddleware } from '../../../core/middlewars/input-validtion-result.middleware';
import { blogInputDtoValidation } from '../validation/blogInputDtoValidation';
import { updateBlogHandler } from './handlers/update-blog.handler';
import { deleteBlogHandler } from './handlers/delete-blog.handler';

export const blogRouter = Router({});

blogRouter
  //   .use(superAdminGuardMiddleware)
  .get('', getAllBlogsHandler)
  .get('/:id', idValidation, inputValidationResultMiddleware, getBlogHandler)
  .post(
    '',
    createBlogHandler,
  )
  .put(
    '/:id',
    idValidation,
    blogInputDtoValidation,
    inputValidationResultMiddleware,
    updateBlogHandler,
  )
  .delete(
    '/:id',
    idValidation,
    inputValidationResultMiddleware,
    deleteBlogHandler,
  );
