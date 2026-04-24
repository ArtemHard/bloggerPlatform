import { ValidationError } from '../../../core/types/validationError';
import { LikeInputDto } from '../dto/like.input-dto';
import { likeSchema } from './shemas/like.schema';

export const likeInputDtoValidation = (
  data: LikeInputDto,
): ValidationError[] => {
  const result = likeSchema.safeParse(data);
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
