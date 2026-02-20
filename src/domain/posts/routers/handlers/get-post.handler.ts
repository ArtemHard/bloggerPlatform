import { Request, Response } from 'express';
import { postsRepository } from '../../../repositories/posts.repository';
import { mapToPostViewModel } from './mappers/map-to-post-view-model';

export const getPostHandler = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  try {
    const post = await postsRepository.findById(id);

    if (!post) {
      return res.status(404).send({ message: 'Post not found' });
    }

    return res.status(200).send(mapToPostViewModel(post));
  } catch (error) {
    return res.status(500).send();
  }
};
