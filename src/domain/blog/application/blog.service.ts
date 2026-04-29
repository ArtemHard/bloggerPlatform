import { inject, injectable } from 'inversify';
import { WithId } from 'mongodb';
import { TYPES } from '../../../ioc/ioc.types';
import { IBlogsRepository } from '../../repositories/types/blogs.repository.interface';
import { BlogQueryInput } from '../routers/input/blog-query.input';
import { Blog } from '../validation/types/blog';

@injectable()
export class BlogService {
  @inject(TYPES.BlogsRepository) private blogsRepository!: IBlogsRepository;

  constructor() {}

  async findMany(
    queryDto: BlogQueryInput,
  ): Promise<{ items: WithId<Blog>[]; totalCount: number }> {
    return this.blogsRepository.findAllBlogs(queryDto);
  }
};
