import {
  FieldValidationError,
  validationResult,
  ValidationError as ValidationErrorExpress,
} from 'express-validator';
import { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../types/validationError';
import { ValidationErrorDto } from '../types/validationError.dto';
import { HttpStatus } from '../types/http-statuses';

export const createErrorMessages = (
  errors: ValidationError[],
): ValidationErrorDto => {
  return { errorsMessages: errors };
};

const formatErrors = (error: ValidationErrorExpress): ValidationError => {
  const expressError = error as unknown as FieldValidationError;

  return {
    field: expressError.path,
    message: expressError.msg,
  };
};

export const inputValidationResultMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req)
    .formatWith(formatErrors)
    .array({ onlyFirstError: true });

  if (errors.length > 0) {
    res.status(HttpStatus.BadRequest).json({ errorMessages: errors });
    return;
  }

  next();
};
