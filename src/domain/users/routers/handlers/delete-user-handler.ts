import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core/types/http-statuses';
import { createErrorMessages } from '../../../../core/middlewars/input-validtion-result.middleware';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { IUsersQueryRepository } from '../../../repositories/types/users-query.repository.interface';
import { UsersService } from '../../domain/user.service';

const usersQwRepository = container.get<IUsersQueryRepository>(TYPES.UsersQueryRepository);
const usersService = container.get<UsersService>(TYPES.UsersService);

export const deleteUserHandler = async (
   req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

   const user = await usersQwRepository.findById(id);

    if (!user) {
      return res
        .status(HttpStatus.NotFound)
        .send(createErrorMessages([{ field: 'id', message: 'user not found' }]));
    }

    try {
      await usersService.delete(id);
      return res.sendStatus(HttpStatus.NoContent);
    } catch (error) {
      return res.status(HttpStatus.InternalServerError).send();
    }
  };
  
