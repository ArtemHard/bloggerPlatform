import { Post } from '../../validation/types/posts';

export type PostAttributes = Omit<Post, 'id' >;
