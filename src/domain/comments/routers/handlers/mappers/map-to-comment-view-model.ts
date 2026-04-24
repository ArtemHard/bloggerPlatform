import { WithId } from 'mongodb';
import { Post } from '../../../../blog/validation/types/posts';
import { CommentType, LikesInfo } from '../../../types';
import { LikeStatus } from '../../../enums/like-status.enum';

export const mapToCommentViewModel = (post: WithId<CommentType>, currentUserId?: string) => {
  // Расчет likesInfo
  const likes = post.likes || [];
  const likesCount = likes.filter(like => like.status === LikeStatus.Like).length;
  const dislikesCount = likes.filter(like => like.status === LikeStatus.Dislike).length;
  
  // Определение статуса текущего пользователя
  let myStatus: LikeStatus = LikeStatus.None;
  if (currentUserId) {
    const userLike = likes.find(like => like.userId === currentUserId);
    if (userLike) {
      myStatus = userLike.status;
    }
  }

  const likesInfo: LikesInfo = {
    likesCount,
    dislikesCount,
    myStatus
  };

  return {
    id: post._id.toString(),
    content: post.content,
    commentatorInfo: {
      userId: post.commentatorInfo.userId,
      userLogin: post.commentatorInfo.userLogin,
    },
    createdAt: post.createdAt,
    likesInfo
  };
};
