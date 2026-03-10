import { Request, Response, Router } from 'express';

import { inputValidationResultMiddleware } from '../../../core/middlewars/input-validtion-result.middleware';

import { paginationAndSortingValidation } from '../../../core/middlewars/validation/query-pagination-sorting.validation-middleware';

import { usersQwRepository } from '../infrastructure/user.query.repository';
import { superAdminGuardMiddleware } from '../../../middlewares/super-admin.guard-middleware';
import { create } from 'node:domain';
import { createUserHandler } from './handlers/create-user.handler';
import { idValidation } from '../../../core/middlewars/validatinos';
import { deleteUserHandler } from './handlers/delete-user-handler';
import { UserSortField } from './handlers/input/user-sort-field';
import { RequestWithQuery } from '../../../core/types/requests';
import { UsersQueryFieldsType } from './handlers/input/user-query.input';
import { IPagination } from '../../../core/types/pagination';
import { IUserView } from '../types/user.view.interface';
import { getUsersHandler } from './handlers/get-users-list.handler';

export const userRouter = Router({});

userRouter
  //   .use(superAdminGuardMiddleware)
  .get(
    '',
    //TODO добавить user sort field
    paginationAndSortingValidation(UserSortField),
    inputValidationResultMiddleware,
    //@ts-expect-error  уже используете paginationAndSortingValidation перед хэндлером, и он гарантированно парсит поля в числа
    getUsersHandler,
  )
  // .get('/:id', idValidation, inputValidationResultMiddleware, getBlogHandler)
  .post('', superAdminGuardMiddleware, createUserHandler)
  // .put(
  //   '/:id',
  //   idValidation,
  //   superAdminGuardMiddleware,
  //   updateBlogHandler,
  // )
  .delete(
    '/:id',
    superAdminGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    deleteUserHandler,
  );
// .get(
//   '/:id/posts',
//   idValidation,
//   paginationAndSortingValidation(PostSortField),
//   inputValidationResultMiddleware,
//   //@ts-expect-error  уже используете paginationAndSortingValidation перед хэндлером, и он гарантированно парсит поля в числа
//   getBlogPostsListHandler,
// )
// .post(
//   '/:id/posts',
//   superAdminGuardMiddleware,
//   idValidation,
//   inputValidationResultMiddleware,
//   createBlogPostHandler,
// );
