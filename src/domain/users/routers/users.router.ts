import { Request, Response, Router } from 'express';

import { inputValidationResultMiddleware } from '../../../core/middlewars/input-validtion-result.middleware';

import { paginationAndSortingValidation } from '../../../core/middlewars/validation/query-pagination-sorting.validation-middleware';

import { container } from '../../../ioc/ioc.container';
import { TYPES } from '../../../ioc/ioc.types';
import { IUsersQueryRepository } from '../../repositories/types/users-query.repository.interface';

const usersQwRepository = container.get<IUsersQueryRepository>(TYPES.UsersQueryRepository);
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
