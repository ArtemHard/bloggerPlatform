import { injectable } from 'inversify';
import { ObjectId, WithId } from 'mongodb';
import { commentsCollection } from '../../db/mongo.db';
import { CommentInputDto } from '../comments/dto/comment.input-dto';
import { CommentType, CommentLike } from '../comments/types';
import { LikeStatus } from '../comments/enums/like-status.enum';
import { ICommentsRepository } from './types/comments.repository.interface';

@injectable()
export class CommentsRepository implements ICommentsRepository {
  async findById(id: string): Promise<WithId<CommentType> | null> {
    return await commentsCollection.findOne({ _id: new ObjectId(id) });
  }

  async findByIdOrFail(id: string): Promise<WithId<CommentType> | null> {
    const res = await commentsCollection.findOne({ _id: new ObjectId(id) });

    return res;
  }

  // Создать новый comment
  async create(dto: CommentInputDto): Promise<WithId<CommentType>> {
    const newComment = {
      ...dto,
      createdAt: new Date().toISOString(),
    };

    const insertResult = await commentsCollection.insertOne(newComment);

    return { ...newComment, _id: insertResult.insertedId };
  }

  // Обновить comment по ID
  async update(commentId: string, content: string): Promise<void> {
    const updateResult = await commentsCollection.updateOne(
      { _id: new ObjectId(commentId) },
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
    const deleteResult = await commentsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error('Post not found');
    }

    return;
  }

  // Обновить статус лайка комментария
  async updateLikeStatus(commentId: string, userId: string, likeStatus: LikeStatus): Promise<void> {
    const comment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
    
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Инициализируем массив лайков, если его нет
    if (!comment.likes) {
      comment.likes = [];
    }

    // Находим существующий лайк от этого пользователя
    const existingLikeIndex = comment.likes.findIndex((like: CommentLike) => like.userId === userId);

    if (likeStatus === LikeStatus.None) {
      // Удаляем лайк пользователя, если он существует
      if (existingLikeIndex !== -1) {
        comment.likes.splice(existingLikeIndex, 1);
      }
    } else {
      // Обновляем или добавляем лайк
      if (existingLikeIndex !== -1) {
        comment.likes[existingLikeIndex].status = likeStatus;
      } else {
        comment.likes.push({
          userId,
          status: likeStatus,
          addedAt: new Date().toISOString()
        });
      }
    }

    // Обновляем комментарий в базе данных
    await commentsCollection.updateOne(
      { _id: new ObjectId(commentId) },
      {
        $set: {
          likes: comment.likes
        }
      }
    );

    return;
  }
}
