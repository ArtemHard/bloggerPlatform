import { CommentViewModel } from '../../../comments/types';
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
