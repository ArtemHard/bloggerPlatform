import { Request, Response } from 'express';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { PostsService } from '../../application/posts.service';
import { LikeInputModel } from '../../types/posts';
import { ResultStatus } from '../../../../common/result/resultCode';
import { log } from 'console';

const postsService = container.get<PostsService>(TYPES.PostsService);

export const updatePostLikeStatusHandler = async (
  req: Request<{ postId: string }, never, LikeInputModel>,
  res: Response,
) => {
  const { postId } = req.params;
  const { likeStatus } = req.body;
  const userId = req.user!.id;
  
  const result = await postsService.updatePostLikeStatus(postId, userId, likeStatus);

  if (result.status === ResultStatus.Success) {
    return res.status(204).send();
  }

  if (result.status === ResultStatus.NotFound) {
    return res.status(404).json({
      errorsMessages: result.extensions,
    });
  }

  if (result.status === ResultStatus.BadRequest) {
    return res.status(400).send({
      errorsMessages: result.extensions,
    });
  }

  return res.status(500).send();
};
