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
import { createCommentHandler } from './handlers/create-comment.handler';
import { accessTokenGuard } from '../../../auth/api/guards/access.token.guard';
import { getAllCommentsByPostHandler } from './handlers/get-all-comments-by-post.handler';
import { CommentsSortField } from './input/comments-sort-field';

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
  )
  // create comment
  .post(
    '/:id/comments',
    idValidation,
    accessTokenGuard,
    inputValidationResultMiddleware,
    createCommentHandler,
  )
  // get comments by post id
  .get(
    '/:id/comments',
    idValidation,
    paginationAndSortingValidation(CommentsSortField),
    inputValidationResultMiddleware,
    // @ts-ignore не понятно, почему не видит типизацию для query
    getAllCommentsByPostHandler,
  );
