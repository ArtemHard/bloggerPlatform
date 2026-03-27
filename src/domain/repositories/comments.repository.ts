import { PostInputDto } from '../posts/dto/post.input-dto';
import { Post } from '../blog/validation/types/posts';
import { ObjectId, WithId } from 'mongodb';
import {
  blogsCollection,
  commentsCollection,
  postsCollection,
} from '../../db/mongo.db';
import { PostQueryInput } from '../posts/routers/input/post-query.input';
import { findPaginated } from '../../core/utils/pagination.util';
import { CommentInputDto } from '../comments/dto/comment.input-dto';
import { CommentType } from '../comments/types';

export const commentsRepository = {
  // Найти все posts
//   async findAllPosts(
//     queryDto: PostQueryInput,
//   ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
//     return findPaginated<Post>(postsCollection, {}, queryDto);
//   },

//   async findMany(
//     queryDto: PostQueryInput,
//   ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
//     const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
//     const filter = {};
//     const skip = (pageNumber - 1) * pageSize;

//     const [items, totalCount] = await Promise.all([
//       postsCollection
//         .find(filter)
//         .sort({ [sortBy]: sortDirection })
//         .skip(skip)
//         .limit(pageSize)
//         .toArray(),
//       postsCollection.countDocuments(filter),
//     ]);
//     return { items, totalCount };
//   },

//   async findPostsByBlog(
//     queryDto: PostQueryInput,
//     blogId: string,
//   ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
//     return findPaginated<Post>(postsCollection, { blogId }, queryDto);
//   },

  async findById(id: string): Promise<WithId<CommentType> | null> {
    return await commentsCollection.findOne({ _id: new ObjectId(id) });
  },

  async findByIdOrFail(id: string): Promise<WithId<CommentType> | null> {
    const res = await commentsCollection.findOne({ _id: new ObjectId(id) });

    return res;
  },

  // Создать новый comment
  async create(dto: CommentInputDto): Promise<WithId<CommentType>> {
    const newComment = {
      ...dto,
      createdAt: new Date().toISOString(),
    };

    const insertResult = await commentsCollection.insertOne(newComment);

    return { ...newComment, _id: insertResult.insertedId };
  },

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
  },

  // Удалить comment по ID
  async delete(id: string): Promise<void> {
    const deleteResult = await commentsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (deleteResult.deletedCount < 1) {
      throw new Error('Post not found');
    }

    return;
  },
};
