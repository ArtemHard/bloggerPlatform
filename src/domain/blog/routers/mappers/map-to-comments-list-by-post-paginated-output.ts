import { WithId } from 'mongodb';
import { Post } from '../../validation/types/posts';
import { PostListPaginatedOutput } from '../output/post-list-paginated-output';
import { mapToPostViewModel } from '../../../posts/routers/handlers/mappers/map-to-post-view-model';
import { CommentViewModel } from '../../../comments/routers/output/comment.view.model';
import { CommentListPaginatedOutput } from '../../../comments/types';

export function mapToCommentsListByPostPaginatedOutput(
  posts: CommentViewModel[],
  meta: { pageNumber: number; pageSize: number; totalCount: number },
): CommentListPaginatedOutput {
  return {
      items:posts,
      page: meta.pageNumber,
      pageSize: meta.pageSize,
      pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
      totalCount: meta.totalCount,
    }
}
