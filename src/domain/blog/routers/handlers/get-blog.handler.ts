import { Request, Response } from 'express';
import { blogsRepository } from '../../../repositories/blogs.repository';
import { mapToBlogViewModel } from '../mappers/map-to-blog-view-model';

export const getBlogHandler = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

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