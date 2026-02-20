import { Request, Response } from 'express';
import { blogsRepository } from '../../../repositories/blogs.repository';
import { mapToBlogViewModel } from './mappers/map-to-blog-view-model';

export const getAllBlogsHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const blogs = await blogsRepository.findAllBlogs();
    const viewModels = blogs.map(mapToBlogViewModel);
    return res.status(200).send(viewModels);
  } catch (error) {
    return res.status(500).send();
  }
};
