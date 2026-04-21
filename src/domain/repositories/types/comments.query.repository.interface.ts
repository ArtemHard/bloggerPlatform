import { QueryParams } from '../../../core/utils/query-parser.util';
import { IPagination } from '../../../core/types/pagination';
import { CommentViewModel } from '../../comments/routers/output/comment.view.model';
import { PromiseResult } from '../../../common/result/result.type';

export interface ICommentsQueryRepository {
  findAllCommentsInPost({
    postId,
    sortQueryDto,
  }: {
    postId: string;
    sortQueryDto: QueryParams;
  }): Promise<PromiseResult<IPagination<CommentViewModel[]>>>;

  findById(commentId: string): Promise<CommentViewModel | null>;
}
