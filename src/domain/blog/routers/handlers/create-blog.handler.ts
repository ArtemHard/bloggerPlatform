import { Request, Response } from 'express';
import { BlogInputDto } from '../../dto/blog.input-dto';
import { blogInputDtoValidation } from '../../validation/blogInputDtoValidation';
import { HttpStatus } from '../../../../core/types/http-statuses';
import { createErrorMessages } from '../../../../core/middlewars/input-validtion-result.middleware';
import { blogsRepository } from '../../../repositories/blogs.repository';
import { mapToBlogViewModel } from './mappers/map-to-blog-view-model';

export const createBlogHandler = async (
  req: Request<{}, {}, BlogInputDto>,
  res: Response,
) => {
  const attributes = req.body;

  const errors = blogInputDtoValidation(attributes);

  if (errors.length > 0) {
    return res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
  }

  try {
    const createdBlog = await blogsRepository.create(attributes);

     const createdBlogViewModel = mapToBlogViewModel(createdBlog);
    
    return res.status(HttpStatus.Created).send(createdBlogViewModel);
  } catch (error) {
    return res.status(HttpStatus.InternalServerError).send();
  }
};
