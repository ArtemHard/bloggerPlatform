import { ValidationError } from '../../../core/types/validationError';
import { CommentInputDto } from '../types';
import { commentSchema } from './shemas/commentShema';


export const commentInputDtoValidation = (
  data: CommentInputDto,
): ValidationError[] => {
  const result = commentSchema.safeParse(data);
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
