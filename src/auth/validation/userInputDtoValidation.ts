import { ValidationError } from '../../core/types/validationError';
import { EmailDto } from '../types/login.dto';
import { emailSchema } from './shemas/user-shema';

export const emailInputDtoValidation = (
  data: EmailDto,
): ValidationError[] => {
  const result = emailSchema.safeParse(data);
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
