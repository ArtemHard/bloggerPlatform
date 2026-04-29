import { injectable } from 'inversify';
import { ObjectId, WithId } from 'mongodb';
import {
  QueryParams,
} from '../../../core/utils/query-parser.util';
import { IPagination } from '../../../core/types/pagination';
import { IUserView } from '../types/user.view.interface';
import { usersCollection } from '../../../db/mongo.db';
import { IUserDB } from '../types/user.db.interface';
import { IUsersQueryRepository } from '../../repositories/types/users-query.repository.interface';

@injectable()
export class UsersQueryRepository implements IUsersQueryRepository {
  async findAllUsers(
    sortQueryDto: QueryParams &
      Partial<{
        searchLoginTerm: string;
        searchEmailTerm: string;
      }>
  ): Promise<IPagination<IUserView[]>> {
    const { searchEmailTerm, searchLoginTerm } = sortQueryDto;

    const { pageNumber, pageSize, skip, sortBy, sortDirection } = sortQueryDto;

    const loginAndEmailFilter: Record<string, any> = {};

    const orConditions = [];

    if (searchLoginTerm) {
      orConditions.push({
        login: { $regex: searchLoginTerm, $options: 'i' },
      });
    }

    if (searchEmailTerm) {
      orConditions.push({
        email: { $regex: searchEmailTerm, $options: 'i' },
      });
    }

    if (orConditions.length > 0) {
      loginAndEmailFilter.$or = orConditions;
    }

    const totalCount =
      await usersCollection.countDocuments(loginAndEmailFilter);

    const users = await usersCollection
      .find(loginAndEmailFilter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    return {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items: users.map((u) => this._getInView(u)),
    };
  }

  async findById(id: string): Promise<IUserView | null> {
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    return user ? this._getInView(user) : null;
  }

  private _getInView(user: WithId<IUserDB>): IUserView {
    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
