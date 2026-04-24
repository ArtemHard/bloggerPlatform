import { Request, Response } from 'express';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { CommentsService } from '../../infrastructure/comments.service';
import { LikeInputDto } from '../../dto/like.input-dto';
import { likeInputDtoValidation } from '../../validation/likeInputDtoValidation';
import { ValidationError } from '../../../../core/types/validationError';

const commentsService = container.get<CommentsService>(TYPES.CommentsService);

export const updateLikeStatusHandler = async (
  req: Request<{ commentId: string }, {}, LikeInputDto>,
  res: Response,
) => {
  const { commentId } = req.params;
  const userId = req.user?.id; // Будет доступно после accessTokenGuard

  if (!userId) {
    res.sendStatus(401);
    return;
  }

  // Валидация тела запроса
  const validationErrors: ValidationError[] = likeInputDtoValidation(req.body);
  if (validationErrors.length > 0) {
    res.status(400).json({
      errorsMessages: validationErrors,
    });
    return;
  }

  const { likeStatus } = req.body;

  const result = await commentsService.updateLikeStatus({
    commentId,
    userId,
    likeStatus,
  });

  switch (result.status) {
    case 'Success':
      res.sendStatus(204);
      break;
    case 'NotFound':
      res.sendStatus(404);
      break;
    default:
      res.sendStatus(400);
      break;
  }
};
