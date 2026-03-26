import { Request, Response } from 'express';
import { commentsRepository } from '../../../repositories/comments.repository';
import { mapToCommentViewModel } from './mappers/map-to-comment-view-model';
import { commentsQwRepository } from '../../infrastructure/comments.query.repository';

export const getCommentHandler = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const result = await commentsQwRepository.findById(req.params.id);

  if (result) {
    res.status(200).send(result);
    return;
  }

  res.sendStatus(404);
  return;
};
