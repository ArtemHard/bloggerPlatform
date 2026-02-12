import { Request, Response } from 'express';
import { db } from '../../../../db/in-memory.db';
import { HttpStatus } from '../../../../core/types/http-statuses';
import { createErrorMessages } from '../../../../core/middlewars/input-validtion-result.middleware';

import { blogsRepository } from '../../../repositories/blogs.repository';
import { postInputDtoValidation } from '../../validation/postInputDtoValidation';
import { postsRepository } from '../../../repositories/posts.repository';

export const updatePostHandler = (req: Request<{ id: string }>, res: Response) => {

  const id = req.params.id

  const postIndex = db.posts.findIndex((post) => post.id === id);

  if (postIndex === -1) {
    return res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: 'id', message: 'post not found' }]));
  }

  const errors = postInputDtoValidation(req.body);

  if (errors.length > 0) {
    return res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
  }

  postsRepository.update(postIndex, req.body)

  return res.sendStatus(HttpStatus.NoContent);
};
