import { ValidationError } from '../../../core/types/validationError';
import { CreateUserDto } from '../types/create-user.dto';
import { userSchema } from './shemas/user-shema';

export const userInputDtoValidation = (
  data: CreateUserDto,
): ValidationError[] => {
  const result = userSchema.safeParse(data);
  if (result.success) {
    return [];
  }

//   return result.error.issues.map((err) => ({
//     field: err.path.join('.'), 
//     message: err.message,
//   }));
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
