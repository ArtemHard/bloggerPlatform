import { Request, Response } from 'express';
import { db } from '../../../../db/in-memory.db';
import { HttpStatus } from '../../../../core/types/http-statuses';
import { createErrorMessages } from '../../../../core/middlewars/input-validtion-result.middleware';
import { blogInputDtoValidation } from '../../validation/blogInputDtoValidation';
import { blogsRepository } from '../../../repositories/blogs.repository';

export const deleteBlogHandler = (req: Request<{ id: string }>, res: Response) => {

  const id = req.params.id

  const blog = blogsRepository.findById(id);

  if (!blog) {
    return res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: 'id', message: 'blog not found' }]));
  }

  blogsRepository.delete(id)

  return res.sendStatus(HttpStatus.NoContent);
};
