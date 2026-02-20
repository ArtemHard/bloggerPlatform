import { BlogInputDto } from '../blog/dto/blog.input-dto';
import { Blog } from '../blog/validation/types/blog';
import { ObjectId, WithId } from 'mongodb';
import { blogsCollection } from '../../db/mongo.db';

export const blogsRepository = {
  // Найти все blogs
  async findAllBlogs(): Promise<WithId<Blog>[]> {
    return blogsCollection.find().toArray();
  },

  // Найти blog по ID
  async findById(id: string): Promise<WithId<Blog> | null> {
    return blogsCollection.findOne({ _id: new ObjectId(id) });
  },

  // Создать нового blog
  async create(blog: BlogInputDto): Promise<WithId<Blog>> {
    const createdAt = new Date().toISOString();
    const isMembership = false;

    const insertResult = await blogsCollection.insertOne({
      ...blog,
      createdAt,
      isMembership,
    });

    // Получаем полный документ из базы
    const insertedBlog = await blogsCollection.findOne({
      _id: insertResult.insertedId,
    });

    if (!insertedBlog) {
      throw new Error('Failed to retrieve inserted blog');
    }

    return insertedBlog;
  },

  // Обновить о названии и авторе
  async update(
    blogId: string,
    { description, name, websiteUrl }: BlogInputDto,
  ): Promise<void> {
    const updateResult = await blogsCollection.updateOne(
      {
        _id: new ObjectId(blogId),
      },
      {
        $set: {
          name,
          description,
          websiteUrl,
          
        },
      },
    );

    if (updateResult.matchedCount < 1) {
      throw new Error('Blog not exist');
    }
    return;
  },

  // Удалить blog
  async delete(id: string): Promise<void> {
    const deleteResult = await blogsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error('Driver not exist');
    }
    return;
  },
};
