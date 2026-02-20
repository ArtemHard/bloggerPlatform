import { WithId } from 'mongodb';
import { Post } from '../../../../blog/validation/types/posts';

export const mapToPostViewModel = (post: WithId<Post>) => {
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
  };
};
