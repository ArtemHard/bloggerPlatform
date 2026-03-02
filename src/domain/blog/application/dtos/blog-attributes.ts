import { Blog } from '../../validation/types/blog';

export type BlogAttributes = Omit<Blog, 'id'>;
