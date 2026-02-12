import { Request, Response } from 'express';
import { BlogInputDto } from '../../dto/blog.input-dto';
import { blogInputDtoValidation } from '../../validation/blogInputDtoValidation';
import { HttpStatus } from '../../../../core/types/http-statuses';
import { createErrorMessages } from '../../../../core/middlewars/input-validtion-result.middleware';
import { blogsRepository } from '../../../repositories/blogs.repository';

export const createBlogHandler = (
  req: Request<{}, {}, BlogInputDto>,
  res: Response,
) => {
  const attributes = req.body;

  const errors = blogInputDtoValidation(attributes);

  if (errors.length > 0) {
    return res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
  }

  const createdBlog = blogsRepository.create(attributes);

  res.status(HttpStatus.Created).send(createdBlog);
};
