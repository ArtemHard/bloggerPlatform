import { Router } from 'express';
import { getCommentHandler } from './handlers/get-comment.handler';
import { updateCommentHandler } from './handlers/update-comment.handler';
import { deleteCommentHandler } from './handlers/delete-comment.handler';
import { updateLikeStatusHandler } from './handlers/update-like-status.handler';
import { accessTokenGuard } from '../../../auth/api/guards/access.token.guard';
import { optionalAccessTokenGuard } from '../../../auth/api/guards/optional.access.token.guard';
import { inputValidationResultMiddleware } from '../../../core/middlewars/input-validtion-result.middleware';
import { commentIdValidation, idValidation } from '../../../core/middlewars/validatinos';
import { likeInputValidation } from '../../../core/middlewars/like-input.validation';

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
  optionalAccessTokenGuard,
  inputValidationResultMiddleware,
  getCommentHandler,
);

// Установка статуса лайка для комментария
commentsRouter.put(
  '/:commentId/like-status',
  commentIdValidation,
  accessTokenGuard,
  likeInputValidation,
  inputValidationResultMiddleware,
  updateLikeStatusHandler,
);
