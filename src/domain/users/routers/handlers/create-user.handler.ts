import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core/types/http-statuses';
import { createErrorMessages } from '../../../../core/middlewars/input-validtion-result.middleware';
import { userInputDtoValidation } from '../../validation/userInputDtoValidation';
import { container } from '../../../../ioc/ioc.container';
import { TYPES } from '../../../../ioc/ioc.types';
import { IUsersQueryRepository } from '../../../repositories/types/users-query.repository.interface';
import { UsersService } from '../../domain/user.service';
import { CreateUserDto } from '../../types/create-user.dto';
import { ValidationError } from '../../../../core/errors/errors.handler';

const usersQwRepository = container.get<IUsersQueryRepository>(TYPES.UsersQueryRepository);
const usersService = container.get<UsersService>(TYPES.UsersService);

export const createUserHandler = async (
  req: Request<{}, {}, CreateUserDto>,
  res: Response,
) => {
  const attributes = req.body;
  const errors = userInputDtoValidation(attributes);
  if (errors.length > 0) {
    return res.status(HttpStatus.BadRequest).send(createErrorMessages(errors));
  }

  try {
    const createdUser = await usersService.create(attributes);

    const createdUserFromDB = await usersQwRepository.findById(
      createdUser._id.toString(),
    );

    if (!createdUserFromDB) {
      return res
        .status(HttpStatus.NotFound)
        .send(
          createErrorMessages([
            { field: 'id', message: 'cannot get user from database' },
          ]),
        );
    }

    return res.status(HttpStatus.Created).send(createdUserFromDB);
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return res
        .status(HttpStatus.BadRequest)
        .send({ errorsMessages: error.errorsMessages });
    }

    return res.status(HttpStatus.InternalServerError).send();
  }
};
