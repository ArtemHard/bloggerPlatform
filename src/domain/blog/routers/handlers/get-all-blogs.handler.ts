import { Request, Response } from 'express';
import { blogsRepository } from '../../../repositories/blogs.repository';

export const getAllBlogsHandler = (req: Request, res: Response) => {
  res.status(200).send(blogsRepository.findAllBlogs());
};
