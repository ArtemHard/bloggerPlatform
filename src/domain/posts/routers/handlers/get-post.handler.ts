import { Request, Response } from 'express';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { IPostsRepository } from '../../../repositories/types/posts.repository.interface';
import { PostLike } from '../../validation/types/posts';

const postsRepository = container.get<IPostsRepository>(TYPES.PostsRepository);
import { mapToPostViewModel } from './mappers/map-to-post-view-model';

export const getPostHandler = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  const postId = Array.isArray(id) ? id[0] : id;
  const userId = req.user?.id; // Получаем userId из req.user

  try {
    const post = await postsRepository.findById(postId);

    if (!post) {
      return res.status(404).send({ message: 'Post not found' });
    }
    
    // Если есть userId, нужно получить пост с правильным myStatus
    const postWithUserContext = userId ? {
      ...post,
      extendedLikesInfo: {
        ...post.extendedLikesInfo,
        myStatus: (() => {
          const likes: PostLike[] = (post as any).likes || [];
          const currentUserLike = likes.find(like => like.userId === userId);
          return currentUserLike?.likeStatus || 'None';
        })()
      }
    } : post;

    return res.status(200).send(mapToPostViewModel(postWithUserContext));
  } catch (error) {
    return res.status(500).send();
  }
};
