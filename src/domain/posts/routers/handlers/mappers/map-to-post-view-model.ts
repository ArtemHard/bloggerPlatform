import { WithId } from 'mongodb';
import { Post } from '../../../validation/types/posts';

export const mapToPostViewModel = (post: WithId<Post>) => {
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: post.extendedLikesInfo || {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: []
    }
  };
};
