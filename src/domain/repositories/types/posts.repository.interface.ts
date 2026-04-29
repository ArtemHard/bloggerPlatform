import { WithId } from 'mongodb';
import { Post } from '../../blog/validation/types/posts';
import { PostInputDto } from '../../posts/dto/post.input-dto';
import { PostQueryInput } from '../../posts/routers/input/post-query.input';
import { LikeStatus } from '../../posts/validation/types/posts';

export interface IPostsRepository {
  findAllPosts(
    queryDto: PostQueryInput,
    userId?: string,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }>;

  findMany(
    queryDto: PostQueryInput,
    userId?: string,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }>;

  findPostsByBlog(
    queryDto: PostQueryInput,
    blogId: string,
    userId?: string,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }>;

  findById(id: string): Promise<WithId<Post> | null>;

  findByIdOrFail(id: string): Promise<WithId<Post>>;

  create(dto: PostInputDto): Promise<WithId<Post>>;

  update(
    id: string,
    dto: PostInputDto,
  ): Promise<void>;

  delete(id: string): Promise<void>;

  updatePostLikeStatus(postId: string, userId: string, likeStatus: LikeStatus): Promise<void>;
}
