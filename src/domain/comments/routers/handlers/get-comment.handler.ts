import { Request, Response } from 'express';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { ICommentsQueryRepository } from '../../../repositories/types/comments.query.repository.interface';

const commentsQwRepository = container.get<ICommentsQueryRepository>(TYPES.CommentsQueryRepository);

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
