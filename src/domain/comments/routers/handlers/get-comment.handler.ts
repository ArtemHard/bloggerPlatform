import { Request, Response } from 'express';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { ICommentsRepository } from '../../../repositories/types/comments.repository.interface';
import { ICommentsQueryRepository } from '../../../repositories/types/comments.query.repository.interface';

const commentsRepository = container.get<ICommentsRepository>(TYPES.CommentsRepository);
const commentsQwRepository = container.get<ICommentsQueryRepository>(TYPES.CommentsQueryRepository);
import { mapToCommentViewModel } from './mappers/map-to-comment-view-model';

export const getCommentHandler = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const currentUserId = req.user?.id; // Получаем ID текущего пользователя
  const result = await commentsQwRepository.findById(req.params.id, currentUserId);

  if (result) {
    res.status(200).send(result);
    return;
  }

  res.sendStatus(404);
  return;
};
