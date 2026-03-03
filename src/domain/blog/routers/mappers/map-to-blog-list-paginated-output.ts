import { WithId } from 'mongodb';
import { Post } from '../../validation/types/posts';
import { PostListPaginatedOutput } from '../output/post-list-paginated-output';
import { Blog } from '../../validation/types/blog';
import { BlogListPaginatedOutput } from '../output/blog-list-paginated-output';
import { mapToBlogViewModel } from './map-to-blog-view-model';

export function mapToBlogListPaginatedOutput(
  blogs: WithId<Blog>[],
  meta: { pageNumber: number; pageSize: number; totalCount: number },
): BlogListPaginatedOutput {
  return {
      items: blogs.map(mapToBlogViewModel),
      page: meta.pageNumber,
      pageSize: meta.pageSize,
      pagesCount: Math.ceil(meta.totalCount / meta.pageSize),
      totalCount: meta.totalCount,
    }
}
