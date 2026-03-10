import { ObjectId, WithId } from 'mongodb';
import {
  parseQueryParams,
  QueryParams,
} from '../../../core/utils/query-parser.util';
import { IPagination } from '../../../core/types/pagination';
import { IUserView } from '../types/user.view.interface';
import { usersCollection } from '../../../db/mongo.db';
import { IUserDB } from '../types/user.db.interface';

export const usersQwRepository = {
  async findAllUsers(
    sortQueryDto: QueryParams &
      Partial<{
        searchLoginTerm: string;
        searchEmailTerm: string;
      }>,
  ): Promise<IPagination<IUserView[]>> {
    const { searchEmailTerm, searchLoginTerm } = sortQueryDto;

    const { pageNumber, pageSize, skip, sortBy, sortDirection } =
      parseQueryParams(sortQueryDto);

    const loginAndEmailFilter: Record<string, any> = {};

    if (searchLoginTerm) {
      loginAndEmailFilter.login = {
        $regex: searchLoginTerm,
        $options: 'i',
      };
    }

    if (searchEmailTerm) {
      loginAndEmailFilter.email = {
        $regex: searchEmailTerm,
        $options: 'i',
      };
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
  },
  async findById(id: string): Promise<IUserView | null> {
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    return user ? this._getInView(user) : null;
  },
  _getInView(user: WithId<IUserDB>): IUserView {
    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  },
  _checkObjectId(id: string): boolean {
    return ObjectId.isValid(id);
  },
};
