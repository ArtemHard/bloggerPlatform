import { Router } from 'express';
import { getAllPostsHandler } from './handlers/get-all-posts.handler';
import { createPostHandler } from './handlers/create-post.handler';
import { idValidation } from '../../../core/middlewars/validatinos';
import { inputValidationResultMiddleware } from '../../../core/middlewars/input-validtion-result.middleware';
import { getPostHandler } from './handlers/get-post.handler';
import { updatePostHandler } from './handlers/update-post.handler';
import { deletePostHandler } from './handlers/delete-post.handler';
import { superAdminGuardMiddleware } from '../../../middlewares/super-admin.guard-middleware';
import { paginationAndSortingValidation } from '../../../core/middlewars/validation/query-pagination-sorting.validation-middleware';
import { PostSortField } from './input/post-sort-field';

export const postsRouter = Router({});

postsRouter
  .get('', paginationAndSortingValidation(PostSortField), getAllPostsHandler)
  .get('/:id', idValidation, inputValidationResultMiddleware, getPostHandler)
  .post('', superAdminGuardMiddleware, createPostHandler)
  .put(
    '/:id',
    superAdminGuardMiddleware,
    idValidation,
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
