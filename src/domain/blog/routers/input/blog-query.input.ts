import { PaginationAndSorting } from '../../../../core/types/pagination-and-sorting';
import { PostSortField } from '../../../posts/routers/input/post-sort-field';

export type BlogQueryInput = PaginationAndSorting<PostSortField> &
  Partial<{
    searchNameTerm: string;
  }>;