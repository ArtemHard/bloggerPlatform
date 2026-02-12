import { Request, Response } from 'express';
import { postsRepository } from '../../../repositories/posts.repository';

export const getAllPostsHandler = (req: Request, res: Response) => {
  res.status(200).send(postsRepository.findAllPosts());
};
