import { IPagination } from '../../../core/types/pagination';
import { IUserView } from '../../users/types/user.view.interface';
import { QueryParams } from '../../../core/utils/query-parser.util';

export interface IUsersQueryRepository {
  findAllUsers(
    sortQueryDto: QueryParams &
      Partial<{
        searchLoginTerm: string;
        searchEmailTerm: string;
      }>
  ): Promise<IPagination<IUserView[]>>;

  findById(id: string): Promise<IUserView | null>;
}
