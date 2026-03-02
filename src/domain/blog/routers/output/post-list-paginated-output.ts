import { PaginatedOutput } from '../../../../core/types/paginated.output';
import { PostDataOutput } from './post-data-output';

export type PostListPaginatedOutput = {
    items: PostDataOutput[];
  } & PaginatedOutput;
