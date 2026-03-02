import { BlogInputDto } from '../blog/dto/blog.input-dto';
import { Blog } from '../blog/validation/types/blog';
import { ObjectId, WithId } from 'mongodb';
import { blogsCollection } from '../../db/mongo.db';
import { RepositoryNotFoundError } from '../../core/errors/repository-not-found.error';
import { BlogQueryInput } from '../blog/routers/input/blog-query.input';
import { parseQueryParams } from '../../core/utils/query-parser.util';
import { findPaginated } from '../../core/utils/pagination.util';

export const blogsRepository = {
  // Найти все blogs
  async findAllBlogs(
    queryDto: BlogQueryInput,
  ): Promise<{ items: WithId<Blog>[]; totalCount: number }> {

    const { pageNumber, pageSize, sortBy, sortDirection, skip } =
      parseQueryParams(queryDto);
    const { searchNameTerm } = queryDto;

    const filter: any = {};

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
    }

    return findPaginated<Blog>(blogsCollection, filter, queryDto)
    
    // const items = await blogsCollection
    //   .find(filter)
    //   .sort({ [sortBy]: sortDirection })
    //   .skip(skip)
    //   .limit(pageSize)
    //   .toArray();

    // const totalCount = await blogsCollection.countDocuments(filter);

    // return { items, totalCount };
  },

  // Найти blog по ID
  async findById(id: string): Promise<WithId<Blog> | null> {
    return blogsCollection.findOne({ _id: new ObjectId(id) });
  },

  async findByIdOrFail(id: string): Promise<WithId<Blog>> {
    const res = await blogsCollection.findOne({ _id: new ObjectId(id) });

    if (!res) {
      throw new RepositoryNotFoundError('Blog not exist');
    }
    return res;
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
