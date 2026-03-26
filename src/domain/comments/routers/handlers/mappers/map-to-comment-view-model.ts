import { WithId } from 'mongodb';
import { Post } from '../../../../blog/validation/types/posts';
import { CommentType } from '../../../types';

export const mapToCommentViewModel = (post: WithId<CommentType>) => {
  return {
    id: post._id.toString(),
    content: post.content,
    commentatorInfo: {
      userId: post.commentatorInfo.userId,
      userLogin: post.commentatorInfo.userLogin,
    },
    createdAt: post.createdAt,
  };
};
