import { Response } from 'express';
import { RequestWithQuery } from '../../../../core/types/requests';
import { UsersQueryFieldsType } from './input/user-query.input';
import { parseQueryParams } from '../../../../core/utils/query-parser.util';
import { usersQwRepository } from '../../infrastructure/user.query.repository';

export const getUsersHandler = async (
    req: RequestWithQuery<UsersQueryFieldsType>,
  res: Response,
) => {
     try {
  const {searchEmailTerm,searchLoginTerm  } = req.query;

  const { pageNumber, pageSize, sortBy,sortDirection, skip } = parseQueryParams(req.query);
  
   const allUsers = await usersQwRepository.findAllUsers({
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchEmailTerm,
      searchLoginTerm,
      skip
    });


    return res.status(200).send(allUsers);
  } catch (error) {
    return res.status(500).send();
  }
};