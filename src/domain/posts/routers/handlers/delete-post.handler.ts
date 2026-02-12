import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core/types/http-statuses';
import { createErrorMessages } from '../../../../core/middlewars/input-validtion-result.middleware';
import { postsRepository } from '../../../repositories/posts.repository';
import { db } from '../../../../db/in-memory.db';

export const deletePostHandler = (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const id = req.params.id;

  const index = db.posts.findIndex((post) => post.id === id);

  if (index === -1) {
    return res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: 'id', message: 'post not found' }]));
  }

  postsRepository.delete(index);

  return res.sendStatus(HttpStatus.NoContent);
};
