import { Request, Response } from 'express';
import { postsRepository } from '../../../repositories/posts.repository';
import { mapToPostViewModel } from './mappers/map-to-post-view-model';

export const getAllPostsHandler = async (
  req: Request,
  res: Response,
) => {
  try {
    const posts = await postsRepository.findAllPosts();
    const viewModels = posts.map(mapToPostViewModel);
    return res.status(200).send(viewModels);
  } catch (error) {
    return res.status(500).send();
  }
};
