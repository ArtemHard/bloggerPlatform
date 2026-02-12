import { Router } from 'express';
import { getAllPostsHandler } from './handlers/get-all-posts.handler';
import { createPostHandler } from './handlers/create-post.handler';
import { idValidation } from '../../../core/middlewars/validatinos';
import { inputValidationResultMiddleware } from '../../../core/middlewars/input-validtion-result.middleware';
import { getPostHandler } from './handlers/get-post.handler';
import { postInputDtoValidation } from '../validation/postInputDtoValidation';
import { updatePostHandler } from './handlers/update-post.handler';
import { deletePostHandler } from './handlers/delete-post.handler';
import { superAdminGuardMiddleware } from '../../../middlewares/super-admin.guard-middleware';

export const postsRouter = Router({});

postsRouter.get('', getAllPostsHandler)
  .get('/:id', idValidation, inputValidationResultMiddleware, getPostHandler)
 .post(
    '',
    superAdminGuardMiddleware,
    createPostHandler
  )
  .put(
      '/:id',
      superAdminGuardMiddleware,
      idValidation,
      postInputDtoValidation,
      inputValidationResultMiddleware,
      updatePostHandler,
    )
    .delete(
      '/:id',
      superAdminGuardMiddleware,
      idValidation,
      inputValidationResultMiddleware,
      deletePostHandler,
    );
