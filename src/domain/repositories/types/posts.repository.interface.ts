import { Post } from '../../posts/validation/types/posts';
import { PostInputDto } from '../../posts/dto/post.input-dto';
import { PostQueryInput } from '../../posts/routers/input/post-query.input';
import { LikeStatus } from '../../posts/validation/types/posts';
import { PostDocument } from '../../posts/domain/post.schema';

export interface IPostsRepository {
  findAllPosts(
    queryDto: PostQueryInput,
    userId?: string,
  ): Promise<{ items: PostDocument[]; totalCount: number }>;

  findMany(
    queryDto: PostQueryInput,
    userId?: string,
  ): Promise<{ items: PostDocument[]; totalCount: number }>;

  findPostsByBlog(
    queryDto: PostQueryInput,
    blogId: string,
    userId?: string,
  ): Promise<{ items: PostDocument[]; totalCount: number }>;

  findById(id: string): Promise<PostDocument | null>;

  findByIdOrFail(id: string): Promise<PostDocument>;

  create(dto: PostInputDto): Promise<PostDocument>;

  update(
    id: string,
    dto: PostInputDto,
  ): Promise<void>;

  delete(id: string): Promise<void>;

  updatePostLikeStatus(postId: string, userId: string, likeStatus: LikeStatus): Promise<void>;
}
