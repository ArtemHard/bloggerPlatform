import { PaginatedOutput } from '../../../../core/types/paginated.output';
import { BlogViewModel } from '../../validation/types/blog';

export type BlogListPaginatedOutput = {
    items: BlogViewModel[];
  } & PaginatedOutput;
