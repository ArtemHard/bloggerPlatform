import { Response } from 'express';
import { RepositoryNotFoundError } from './repository-not-found.error';
import { HttpStatus } from '../types/http-statuses';
import { createErrorMessages } from '../middlewars/input-validtion-result.middleware';

export function errorsHandler(error: unknown, res: Response): void {
  if (error instanceof RepositoryNotFoundError) {
    const httpStatus = HttpStatus.NotFound;

    res.status(httpStatus).send(
      createErrorMessages([
        {
          field: 'id',
          message: error.message,
        },
      ]),
    );

    return;
  }

  res.status(HttpStatus.InternalServerError);
  return;
}


export class ValidationError extends Error {
  constructor(public errorsMessages: Array<{ field: string; message: string }>) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}