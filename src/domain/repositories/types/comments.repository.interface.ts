import { CommentInputDto } from '../../comments/dto/comment.input-dto';
import { CommentType } from '../../comments/types';
import { LikeStatus } from '../../comments/enums/like-status.enum';
import { CommentDocument } from '../../comments/domain/comment.schema';

export interface ICommentsRepository {
  findById(id: string): Promise<CommentDocument | null>;

  findByIdOrFail(id: string): Promise<CommentDocument | null>;

  create(dto: CommentInputDto, userId: string, userLogin: string, postId: string): Promise<CommentDocument>;

  update(commentId: string, content: string): Promise<void>;

  delete(id: string): Promise<void>;

  updateLikeStatus(commentId: string, userId: string, likeStatus: LikeStatus): Promise<void>;
}
