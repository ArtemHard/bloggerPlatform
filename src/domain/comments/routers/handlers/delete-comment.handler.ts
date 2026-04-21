import { Request, Response } from 'express';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { CommentsService } from '../../infrastructure/comments.service';
import { ResultStatus } from '../../../../common/result/resultCode';

const commentsService = container.get<CommentsService>(TYPES.CommentsService);


export const deleteCommentHandler = async (
  req: Request<{ commentId: string }>,
  res: Response,
): Promise<void> => {
  const commentId = req.params.commentId;
  const userId = req.user!.id;

  const result = await commentsService.deleteCommentById(
    commentId,
    userId
  );

  if (result.status === ResultStatus.Success) {
    res.sendStatus(204);
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