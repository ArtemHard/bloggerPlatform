import { ObjectId, WithId } from 'mongodb';
import { QueryParams } from '../../../core/utils/query-parser.util';
import { IPagination } from '../../../core/types/pagination';
import { commentsCollection, usersCollection } from '../../../db/mongo.db';
import { commentsRepository } from '../../repositories/comments.repository';
import { CommentType } from '../types';
import { CommentViewModel } from '../routers/output/comment.view.model';
import { mapToCommentViewModel } from '../routers/handlers/mappers/map-to-comment-view-model';
import { PromiseResult } from '../../../common/result/result.type';
import { ResultStatus } from '../../../common/result/resultCode';
import { postsRepository } from '../../repositories/posts.repository';

export const commentsQwRepository = {
  async findAllCommentsInPost({
    postId,
    sortQueryDto,
  }: {
    postId: string;
    sortQueryDto: QueryParams;
  }): Promise<PromiseResult<IPagination<CommentViewModel[]>>> {
    const { pageNumber, pageSize, skip, sortBy, sortDirection } = sortQueryDto;

    const post = await postsRepository.findById(postId);

    if (!post) {
      return {
        status: ResultStatus.NotFound,
        extensions: [{ field: 'postId', message: 'Post not found' }],
        data: [] as unknown as IPagination<CommentViewModel[]>,
      };
    }

    const totalCount = await commentsCollection.countDocuments();

    const comments = await commentsCollection
      .find({ postId })
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: {
        pagesCount: Math.ceil(totalCount / pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount,
        items: comments.map((c) => this._getInView(c)),
      },
    };
  },
  async findById(id: string): Promise<CommentViewModel | null> {
    const result = await commentsRepository.findById(id);

    return result ? this._getInView(result) : null;
  },

  _getInView(comment: WithId<CommentType>): CommentViewModel {
    return mapToCommentViewModel(comment);
  },
  _checkObjectId(id: string): boolean {
    return ObjectId.isValid(id);
  },
};
