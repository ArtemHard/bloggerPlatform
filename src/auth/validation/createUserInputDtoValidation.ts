import { ValidationError } from '../../core/types/validationError';
import { CreateUserDto } from '../../domain/users/types/create-user.dto';
import { createUserSchema } from './shemas/create-user-shema';

export const createUserInputDtoValidation = (
  data: CreateUserDto,
): ValidationError[] => {
  const result = createUserSchema.safeParse(data);
  if (result.success) {
    return [];
  }

  const uniqueErrors = result.error.issues
    .map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))
    .reduce<ValidationError[]>((acc, error) => {
      // Добавляем только если такого поля ещё нет в результате
      if (!acc.some((e) => e.field === error.field)) {
        acc.push(error);
      }
      return acc;
    }, []);

  return uniqueErrors;
};
