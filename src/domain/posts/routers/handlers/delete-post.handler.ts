import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core/types/http-statuses';
import { createErrorMessages } from '../../../../core/middlewars/input-validtion-result.middleware';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { IPostsRepository } from '../../../repositories/types/posts.repository.interface';

const postsRepository = container.get<IPostsRepository>(TYPES.PostsRepository);

export const deletePostHandler = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  const post = await postsRepository.findById(id);

  if (!post) {
    return res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: 'id', message: 'post not found' }]));
  }

  try {
    await postsRepository.delete(id);
    return res.sendStatus(HttpStatus.NoContent);
  } catch (error) {
    return res.status(HttpStatus.InternalServerError).send();
  }
};
