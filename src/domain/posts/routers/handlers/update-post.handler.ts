import { Request, Response } from 'express';
import { PostInputDto } from '../../dto/post.input-dto';
import { postInputDtoValidation } from '../../validation/postInputDtoValidation';
import { HttpStatus } from '../../../../core/types/http-statuses';
import { createErrorMessages } from '../../../../core/middlewars/input-validtion-result.middleware';
import { postsRepository } from '../../../repositories/posts.repository';

export const updatePostHandler = async (
  req: Request<{ id: string }, {}, PostInputDto>,
  res: Response,
) => {
  const { id } = req.params;
  const body = req.body;

  const post = await postsRepository.findById(id);

  if (!post) {
    return res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: 'id', message: 'post not found' }]));
  }

  const errors = postInputDtoValidation(body);

  if (errors.length > 0) {
    return res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
  }

  try {
    await postsRepository.update(id, body);
    return res.sendStatus(HttpStatus.NoContent);
  } catch (error) {
    return res.status(HttpStatus.InternalServerError).send();
  }
};
