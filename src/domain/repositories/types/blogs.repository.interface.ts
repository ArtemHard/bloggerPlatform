import { Blog } from '../../blog/validation/types/blog';
import { BlogInputDto } from '../../blog/dto/blog.input-dto';
import { BlogQueryInput } from '../../blog/routers/input/blog-query.input';
import { BlogDocument } from '../../blog/domain/blog.schema';

export interface IBlogsRepository {
  findAllBlogs(
    queryDto: BlogQueryInput,
  ): Promise<{ items: BlogDocument[]; totalCount: number }>;

  findById(id: string): Promise<BlogDocument | null>;

  findByIdOrFail(id: string): Promise<BlogDocument>;

  create(blog: BlogInputDto): Promise<BlogDocument>;

  update(blogId: string, dto: BlogInputDto): Promise<void>;

  delete(id: string): Promise<void>;
}
