import { Request, Response } from 'express';

import { CommentInputDto } from '../../types/comments';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { CommentsService } from '../../infrastructure/comments.service';

const commentsService = container.get<CommentsService>(TYPES.CommentsService);
import { ResultStatus } from '../../../../common/result/resultCode';
import { commentInputDtoValidation } from '../../validation/commentInputDtoValidation';
import { HttpStatus } from '../../../../core/types/http-statuses';
import { createErrorMessages } from '../../../../core/middlewars/input-validtion-result.middleware';

export const updateCommentHandler = async (
  req: Request<{ commentId: string }, {}, CommentInputDto>,
  res: Response,
): Promise<void> => {
  const commentId = req.params.commentId;
  const { content } = req.body;

  const userId = req.user!.id;

  const errors = commentInputDtoValidation({ content });

  if (errors.length > 0) {
    res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
    return;
  }

  const result = await commentsService.updateCommentById({
    commentId,
    content,
    userId,
  });

  if (result.status === ResultStatus.Success) {
    res.sendStatus(HttpStatus.NoContent);
    return;
  }

  if (result.status === ResultStatus.NotFound) {
    res.sendStatus(404);
    return;
  }

  if (result.status === ResultStatus.Forbidden) {
    res.sendStatus(403);
    return;
  }

  res.sendStatus(500);
};
