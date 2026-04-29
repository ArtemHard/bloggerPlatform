import { injectable } from 'inversify';
import { BlogInputDto } from '../blog/dto/blog.input-dto';
import { Blog } from '../blog/validation/types/blog';
import { RepositoryNotFoundError } from '../../core/errors/repository-not-found.error';
import { BlogQueryInput } from '../blog/routers/input/blog-query.input';
import { IBlogsRepository } from './types/blogs.repository.interface';
import { BlogModel, BlogDocument } from '../blog/domain/blog.schema';

@injectable()
export class BlogsRepository implements IBlogsRepository {
  // Find all blogs
  async findAllBlogs(
    queryDto: BlogQueryInput,
  ): Promise<{ items: BlogDocument[]; totalCount: number }> {
    const { searchNameTerm, pageNumber = 1, pageSize = 10, sortBy = 'createdAt', sortDirection = 'desc' } = queryDto;

    const filter: Record<string, unknown> = {};

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
    }

    const skip = (pageNumber - 1) * pageSize;
    const totalCount = await BlogModel.countDocuments(filter);
    
    const blogs = await BlogModel
      .find(filter)
      .sort({ [sortBy]: sortDirection === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(pageSize);

    return { items: blogs, totalCount };
  }

  // Find blog by ID
  async findById(id: string): Promise<BlogDocument | null> {
    return BlogModel.findById(id);
  }

  async findByIdOrFail(id: string): Promise<BlogDocument> {
    const res = await BlogModel.findById(id);

    if (!res) {
      throw new RepositoryNotFoundError('Blog not exist');
    }
    return res;
  }

  // Create new blog
  async create(blog: BlogInputDto): Promise<BlogDocument> {
    const newBlog = BlogModel.createBlog(blog.name, blog.description, blog.websiteUrl);
    await newBlog.save();
    return newBlog;
  }

  // Update name and author
  async update(
    blogId: string,
    { description, name, websiteUrl }: BlogInputDto,
  ): Promise<void> {
    const updateResult = await BlogModel.updateOne(
      { _id: blogId },
      {
        $set: {
          name,
          description,
          websiteUrl,
        },
      },
    );

    if (updateResult.modifiedCount < 1) {
      throw new Error('Blog not exist');
    }
    return;
  }

  // Delete blog
  async delete(id: string): Promise<void> {
    const deleteResult = await BlogModel.deleteOne({ _id: id });

    if (deleteResult.deletedCount < 1) {
      throw new Error('Blog not exist');
    }
    return;
  }
}
