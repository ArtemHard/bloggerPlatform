import { QueryParams } from '../../../core/utils/query-parser.util';
import { IPagination } from '../../../core/types/pagination';
import { CommentViewModel } from '../../comments/routers/output/comment.view.model';
import { PromiseResult } from '../../../common/result/result.type';

export interface ICommentsQueryRepository {
  findAllCommentsInPost({
    postId,
    sortQueryDto,
    currentUserId,
  }: {
    postId: string;
    sortQueryDto: QueryParams;
    currentUserId?: string;
  }): Promise<PromiseResult<IPagination<CommentViewModel[]>>>;

  findById(commentId: string, currentUserId?: string): Promise<CommentViewModel | null>;
}
