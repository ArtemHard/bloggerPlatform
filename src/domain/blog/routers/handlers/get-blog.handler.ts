import { Request, Response } from 'express';
import { blogsRepository } from '../../../repositories/blogs.repository';

export const getBlogHandler = (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;

  const blog = blogsRepository.findById(id);

  if (!blog) {
    res.status(404).send({ message: 'Blog not found' });
    return;
  }

  res.status(200).send(blog);
};
