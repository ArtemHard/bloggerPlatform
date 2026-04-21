import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core/types/http-statuses';
import { createErrorMessages } from '../../../../core/middlewars/input-validtion-result.middleware';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { IBlogsRepository } from '../../../repositories/types/blogs.repository.interface';

const blogsRepository = container.get<IBlogsRepository>(TYPES.BlogsRepository);

export const deleteBlogHandler = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  const blog = await blogsRepository.findById(id);

  if (!blog) {
    return res
      .status(HttpStatus.NotFound)
      .send(createErrorMessages([{ field: 'id', message: 'blog not found' }]));
  }

  try {
    await blogsRepository.delete(id);
    return res.sendStatus(HttpStatus.NoContent);
  } catch (error) {
    return res.status(HttpStatus.InternalServerError).send();
  }
};
