import { WithId } from 'mongodb';
import { CommentInputDto } from '../../comments/dto/comment.input-dto';
import { CommentType } from '../../comments/types';
import { LikeStatus } from '../../comments/enums/like-status.enum';

export interface ICommentsRepository {
  findById(id: string): Promise<WithId<CommentType> | null>;

  findByIdOrFail(id: string): Promise<WithId<CommentType> | null>;

  create(dto: CommentInputDto): Promise<WithId<CommentType>>;

  update(commentId: string, content: string): Promise<void>;

  delete(id: string): Promise<void>;

  updateLikeStatus(commentId: string, userId: string, likeStatus: LikeStatus): Promise<void>;
}
