import { id } from 'zod/v4/locales';
import { generateUniqueID } from '../../core/utils/generate-id';
import { db } from '../../db/in-memory.db';
import { BlogInputDto } from '../blog/dto/blog.input-dto';
import { Blog } from '../blog/validation/types/blog';

export const blogsRepository = {
  // Найти все blogs
  findAllBlogs(): Blog[] {
    return db.blogs.slice(-15);
  },

  // Найти blog по ID
  findById(id: string): Blog | null {
    const blog = db.blogs.find((blog) => blog.id === id);
    return blog ? { ...blog } : null;
  },

  // Создать нового blog
  create(blog:BlogInputDto): Blog {

    const newBlog: Blog = {
      id: generateUniqueID(db.blogs),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
    }
    
    db.blogs.push(newBlog);
    return newBlog;
  },

  //   // Обновить о названии и авторе
  update(blogIndex: number, dto: BlogInputDto): void {
    const blog = db.blogs[blogIndex]

    db.blogs[blogIndex].name = dto.name;
    db.blogs[blogIndex].description = dto.description;
    db.blogs[blogIndex].websiteUrl = dto.websiteUrl;

    return;
  },

  // Удалить blog
  delete(id: string): undefined | number {
     const index = db.blogs.findIndex((blog) => blog.id === id);

     if (index !== -1) {
       db.blogs.splice(index, 1);
       return index;
     }
    return 
  },
};
