import { Request, Response } from 'express';
import { postsRepository } from '../../../repositories/posts.repository';

export const getPostHandler = (req: Request<{ id: string }>, res: Response) => {
     const { id } = req.params;
    
      const post = postsRepository.findById(id);
    
      if (!post) {
        res.status(404).send({ message: 'Post not found' });
        return;
      }
    
      res.status(200).send(post);
    
  res.status(200).send(postsRepository.findAllPosts());
};
