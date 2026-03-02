import { WithId } from 'mongodb';
import { Post } from '../../validation/types/posts';
import { PostListPaginatedOutput } from '../output/post-list-paginated-output';

export function mapToPostListPaginatedOutput(
  posts: WithId<Post>[],
  meta: { pageNumber: number; pageSize: number; totalCount: number },
): PostListPaginatedOutput {
  return {
      items: posts.map((post) => ({
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
      })),
      page: meta.pageNumber,
      pageSize: meta.pageSize,
      pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
      totalCount: meta.totalCount,
    }
}
