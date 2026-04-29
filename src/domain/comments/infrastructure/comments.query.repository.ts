import { inject, injectable } from 'inversify';
import { QueryParams } from '../../../core/utils/query-parser.util';
import { IPagination } from '../../../core/types/pagination';
import { TYPES } from '../../../ioc/ioc.types';
import { ICommentsRepository } from '../../repositories/types/comments.repository.interface';
import { IPostsRepository } from '../../repositories/types/posts.repository.interface';
import { ICommentsQueryRepository } from '../../repositories/types/comments.query.repository.interface';
import { CommentType } from '../types';
import { CommentViewModel } from '../routers/output/comment.view.model';
import { mapToCommentViewModel } from '../routers/handlers/mappers/map-to-comment-view-model';
import { PromiseResult } from '../../../common/result/result.type';
import { ResultStatus } from '../../../common/result/resultCode';
import { CommentModel, CommentDocument } from '../domain/comment.schema';

@injectable()
export class CommentsQueryRepository implements ICommentsQueryRepository {
  @inject(TYPES.PostsRepository) private postsRepository!: IPostsRepository;
  @inject(TYPES.CommentsRepository) private commentsRepository!: ICommentsRepository;

  constructor() {}

  async findAllCommentsInPost({
    postId,
    sortQueryDto,
    currentUserId,
  }: {
    postId: string;
    sortQueryDto: QueryParams;
    currentUserId?: string;
  }): Promise<PromiseResult<IPagination<CommentViewModel[]>>> {
    const { pageNumber, pageSize, skip, sortBy, sortDirection } = sortQueryDto;

    const post = await this.postsRepository.findById(postId);

    if (!post) {
      return {
        status: ResultStatus.NotFound,
        extensions: [{ field: 'postId', message: 'Post not found' }],
        data: [] as unknown as IPagination<CommentViewModel[]>,
      };
    }

    const filter = { postId };

    const [comments, totalCount] = await Promise.all([
      CommentModel
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize),
      CommentModel.countDocuments(filter)
    ]);

    return {
      status: ResultStatus.Success,
      extensions: [],
      data: {
        pagesCount: Math.ceil(totalCount / pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount,
        items: comments.map((c: CommentDocument) => this._getInView(c, currentUserId)),
      },
    };
  }

  async findById(commentId: string, currentUserId?: string): Promise<CommentViewModel | null> {
    const result = await this.commentsRepository.findById(commentId);

    return result ? this._getInView(result, currentUserId) : null;
  }

  private _getInView(comment: CommentDocument, currentUserId?: string): CommentViewModel {
    return mapToCommentViewModel(comment, currentUserId);
  }
}
