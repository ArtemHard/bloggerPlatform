import { Router } from 'express';
import { getCommentHandler } from './handlers/get-comment.handler';
import { updateCommentHandler } from './handlers/update-comment.handler';
import { deleteCommentHandler } from './handlers/delete-comment.handler';
import { accessTokenGuard } from '../../../auth/api/guards/access.token.guard';
import { inputValidationResultMiddleware } from '../../../core/middlewars/input-validtion-result.middleware';
import { commentIdValidation, idValidation } from '../../../core/middlewars/validatinos';

export const commentsRouter = Router();

// редактирование комментария по ID
commentsRouter.put(
  '/:commentId',
  commentIdValidation,
  accessTokenGuard,
  // commentInputValidation,
  inputValidationResultMiddleware,
  updateCommentHandler,
);

commentsRouter.delete(
  '/:commentId',
  commentIdValidation,
  accessTokenGuard,
  deleteCommentHandler,
);

// Получение комментария по ID
commentsRouter.get(
  '/:id',
  idValidation,
  inputValidationResultMiddleware,
  getCommentHandler,
);
