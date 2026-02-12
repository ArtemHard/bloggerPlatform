import { Blog } from '../blog/validation/types/blog';
import { Post } from '../blog/validation/types/posts';

// export type Database = {
//   blogs: Record<string, Omit<Blog, 'id'>>;
//   posts: Record<string, Record<string, Omit<Post, 'id'>>>;
// };

export type Database = {
  blogs: Blog[]
  posts: Post[]
};