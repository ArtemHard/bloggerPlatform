import { injectable } from 'inversify';
import { CommentInputDto } from '../comments/dto/comment.input-dto';
import { CommentType, CommentLike } from '../comments/types';
import { LikeStatus } from '../comments/enums/like-status.enum';
import { ICommentsRepository } from './types/comments.repository.interface';
import { CommentModel, CommentDocument } from '../comments/domain/comment.schema';
import { ICommentDB } from '../comments/types/comment.db.interface';

@injectable()
export class CommentsRepository implements ICommentsRepository {
  async findById(id: string): Promise<CommentDocument | null> {
    return await CommentModel.findById(id);
  }

  async findByIdOrFail(id: string): Promise<CommentDocument | null> {
    const res = await CommentModel.findById(id);

    return res;
  }

  // Создать новый comment
  async create(dto: CommentInputDto, userId: string, userLogin: string, postId: string): Promise<CommentDocument> {
    const newComment = CommentModel.createComment(dto.content, userId, userLogin, postId);
    await newComment.save();
    return newComment;
  }

  // Обновить comment по ID
  async update(commentId: string, content: string): Promise<void> {
    const updateResult = await CommentModel.updateOne(
      { _id: commentId },
      {
        $set: {
          content,
        },
      },
    );

    if (updateResult.matchedCount < 1) {
      throw new Error('Comment not found');
    }
    return;
  }

  // Удалить comment по ID
  async delete(id: string): Promise<void> {
    const deleteResult = await CommentModel.deleteOne({ _id: id });

    if (deleteResult.deletedCount < 1) {
      throw new Error('Comment not found');
    }

    return;
  }

  // Обновить статус лайка комментария
  async updateLikeStatus(commentId: string, userId: string, likeStatus: LikeStatus): Promise<void> {
    const comment = await CommentModel.findById(commentId);
    
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Используем метод модели для обновления лайков
    (comment as any).addLike(userId, likeStatus);
    await comment.save();

    return;
  }
}
