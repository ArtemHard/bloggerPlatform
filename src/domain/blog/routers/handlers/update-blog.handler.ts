import { Request, Response } from 'express';
import { db } from '../../../../db/in-memory.db';
import { HttpStatus } from '../../../../core/types/http-statuses';
import { createErrorMessages } from '../../../../core/middlewars/input-validtion-result.middleware';
import { blogInputDtoValidation } from '../../validation/blogInputDtoValidation';
import { blogsRepository } from '../../../repositories/blogs.repository';

export const updateBlogHandler = (req: Request<{ id: string }>, res: Response) => {

  const id = req.params.id

  const blogIndex = db.blogs.findIndex((blog) => blog.id === id);

  if (blogIndex === -1) {
    return res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: 'id', message: 'blog not found' }]));
  }

  const errors = blogInputDtoValidation(req.body);

  if (errors.length > 0) {
    return res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
  }

  blogsRepository.update(blogIndex, req.body)

  return res.sendStatus(HttpStatus.NoContent);
};
