import { Request, Response } from 'express';
import { BlogInputDto } from '../../dto/blog.input-dto';
import { blogInputDtoValidation } from '../../validation/blogInputDtoValidation';
import { HttpStatus } from '../../../../core/types/http-statuses';
import { createErrorMessages } from '../../../../core/middlewars/input-validtion-result.middleware';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { IBlogsRepository } from '../../../repositories/types/blogs.repository.interface';

const blogsRepository = container.get<IBlogsRepository>(TYPES.BlogsRepository);

export const updateBlogHandler = async (
  req: Request<{ id: string }, {}, BlogInputDto>,
  res: Response,
) => {
  const { id } = req.params;
  const body = req.body;

  const blog = await blogsRepository.findById(id);

  if (!blog) {
    return res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: 'id', message: 'blog not found' }]));
  }

  const errors = blogInputDtoValidation(body);
  if (errors.length > 0) {
    return res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
  }

  try {
    await blogsRepository.update(id, body);
    return res.sendStatus(HttpStatus.NoContent);
  } catch (error) {
    return res.status(HttpStatus.InternalServerError).send();
  }
};
