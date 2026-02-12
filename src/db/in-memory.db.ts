import { Database } from '../domain/types/database';

export const db: Database = {
  blogs: [
    {
      id: '1',
      name: 'Blog 1',
      description: 'Description for Blog 1',
      websiteUrl: 'https://example.com/blog-1',
    },
  ],
  posts: [
    {
      id: '1',
      title: 'Post 1',
      shortDescription: 'Short description for Post 1',
      content: 'Content for Post 1',
      blogId: '1',
      blogName: 'Blog 1',
    },
  ],
};
