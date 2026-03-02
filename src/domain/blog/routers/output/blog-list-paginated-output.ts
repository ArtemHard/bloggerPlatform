import { PaginatedOutput } from '../../../../core/types/paginated.output';
import { Blog } from '../../validation/types/blog';
import { PostDataOutput } from './post-data-output';

export type BlogListPaginatedOutput = {
    items: Blog[];
  } & PaginatedOutput;
