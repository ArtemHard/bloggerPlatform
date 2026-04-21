import { Request, Response } from 'express';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { IBlogsRepository } from '../../../repositories/types/blogs.repository.interface';

const blogsRepository = container.get<IBlogsRepository>(TYPES.BlogsRepository);
import { mapToBlogViewModel } from '../mappers/map-to-blog-view-model';

export const getBlogHandler = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id,  } = req.params;

  try {
    const blog = await blogsRepository.findById(id);

    if (!blog) {
      return res.status(404).send({ message: 'Blog not found' });
    }

    return res.status(200).send(mapToBlogViewModel(blog));
  } catch (error) {
    return res.status(500).send();
  }
};