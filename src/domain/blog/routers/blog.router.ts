import { Router } from 'express';

import { getAllBlogsHandler } from './handlers/get-all-blogs.handler';
import { createBlogHandler } from './handlers/create-blog.handler';
import { idValidation } from '../../../core/middlewars/validatinos';
import { getBlogHandler } from './handlers/get-blog.handler';
import { inputValidationResultMiddleware } from '../../../core/middlewars/input-validtion-result.middleware';
import { blogInputDtoValidation } from '../validation/blogInputDtoValidation';
import { updateBlogHandler } from './handlers/update-blog.handler';
import { deleteBlogHandler } from './handlers/delete-blog.handler';
import { superAdminGuardMiddleware } from '../../../middlewares/super-admin.guard-middleware';

export const blogRouter = Router({});

blogRouter
  //   .use(superAdminGuardMiddleware)
  .get('', getAllBlogsHandler)
  .get('/:id', idValidation, inputValidationResultMiddleware, getBlogHandler)
  .post(
    '',
    superAdminGuardMiddleware,
    createBlogHandler,
  )
  .put(
    '/:id',
    superAdminGuardMiddleware,
    idValidation,
    updateBlogHandler,
  )
  .delete(
    '/:id',
    superAdminGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    deleteBlogHandler,
  );
