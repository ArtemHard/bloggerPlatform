import { generateUniqueID } from '../../core/utils/generate-id';
import { db } from '../../db/in-memory.db';
import { Post } from '../blog/validation/types/posts';
import { PostInputDto } from '../posts/dto/post.input-dto';

export const postsRepository = {
  // Найти все blogs
  findAllPosts(): Post[] {
    return db.posts;
  },

  // Найти видео по ID
  findById(id: string): Post | null {
    return db.posts.find((d) => d.id === id) ?? null;
  },

  // Создать нового post
  create(newPost: PostInputDto): Post {
    const id = generateUniqueID(db.posts);
    const blogName =
      db.blogs.find((b) => b.id === newPost.blogId)?.name || 'Unknown Blog';
    db.posts.push({ id, ...newPost, blogName });

    return { ...newPost, id, blogName };
  },

  update(postIndex: number, dto: PostInputDto): void {
    db.posts[postIndex].title = dto.title;
    db.posts[postIndex].shortDescription = dto.shortDescription;
    db.posts[postIndex].content = dto.content;
    db.posts[postIndex].blogId = dto.blogId;

    return;
  },

  // Удалить post
  delete(index: number): undefined {
    db.posts.splice(index, 1);
  },
};
