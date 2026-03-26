import { PaginationAndSorting } from '../../../../core/types/pagination-and-sorting';
import { CommentsSortField } from './comments-sort-field';
import { PostSortField } from './post-sort-field';

export type PostQueryInput = PaginationAndSorting<PostSortField>;

export type CommentsQueryInput = PaginationAndSorting<CommentsSortField>;