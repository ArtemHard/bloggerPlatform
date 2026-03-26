import { Request, Response } from 'express';
import { CommentInputDto } from '../../../comments/types/comments';
import { ResultStatus } from '../../../../common/result/resultCode';
import { commentsService } from '../../../comments/infrastructure/comments.service';
import { mapToCommentViewModel } from '../../../comments/routers/handlers/mappers/map-to-comment-view-model';
import { commentInputDtoValidation } from '../../../comments/validation/commentInputDtoValidation';
import { HttpStatus } from '../../../../core/types/http-statuses';
import { createErrorMessages } from '../../../../core/middlewars/input-validtion-result.middleware';

export const createCommentHandler = async (
  req: Request<{ id: string }, {}, CommentInputDto>,
  res: Response,
): Promise<void> => {
  const postId = req.params.id;
  const { content } = req.body;
  const userId = req.user!.id;

  const errors = commentInputDtoValidation({ content });

  if (errors.length > 0) {
    res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
    return;
  }

  const result = await commentsService.createComment({
    postId,
    content,
    userId,
  });

  if (result.status === ResultStatus.Success && result.data) {
    res.status(201).send(mapToCommentViewModel(result.data));
    return;
  }

  if (result.status === ResultStatus.BadRequest) {
    res.status(400).send({
      errorsMessages: result.errorMessage,
    });
    return;
  }

  if (result.status === ResultStatus.NotFound) {
    res.sendStatus(404);
    return;
  }

  res.sendStatus(500);
};
