import { Request, Response } from 'express';
import { HttpStatus } from '../../../../core/types/http-statuses';
import { createErrorMessages } from '../../../../core/middlewars/input-validtion-result.middleware';
import { usersService } from '../../domain/user.service';
import { usersQwRepository } from '../../infrastructure/user.query.repository';

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
  
