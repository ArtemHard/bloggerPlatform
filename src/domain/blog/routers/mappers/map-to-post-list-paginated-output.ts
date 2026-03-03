import { WithId } from 'mongodb';
import { Post } from '../../validation/types/posts';
import { PostListPaginatedOutput } from '../output/post-list-paginated-output';
import { mapToPostViewModel } from '../../../posts/routers/handlers/mappers/map-to-post-view-model';

export function mapToPostListPaginatedOutput(
  posts: WithId<Post>[],
  meta: { pageNumber: number; pageSize: number; totalCount: number },
): PostListPaginatedOutput {
  return {
      items: posts.map(mapToPostViewModel),
      page: meta.pageNumber,
      pageSize: meta.pageSize,
      pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
      totalCount: meta.totalCount,
    }
}
