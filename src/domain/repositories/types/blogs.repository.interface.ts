import { WithId } from 'mongodb';
import { Blog } from '../../blog/validation/types/blog';
import { BlogInputDto } from '../../blog/dto/blog.input-dto';
import { BlogQueryInput } from '../../blog/routers/input/blog-query.input';

export interface IBlogsRepository {
  findAllBlogs(
    queryDto: BlogQueryInput,
  ): Promise<{ items: WithId<Blog>[]; totalCount: number }>;

  findById(id: string): Promise<WithId<Blog> | null>;

  findByIdOrFail(id: string): Promise<WithId<Blog>>;

  create(blog: BlogInputDto): Promise<WithId<Blog>>;

  update(blogId: string, dto: BlogInputDto): Promise<void>;

  delete(id: string): Promise<void>;
}
