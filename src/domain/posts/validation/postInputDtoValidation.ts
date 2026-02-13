import { ValidationError } from '../../../core/types/validationError';
import { PostInputDto } from '../dto/post.input-dto';
import { postSchema } from './shemas/post-schema';


export const postInputDtoValidation = (
  data: PostInputDto,
): ValidationError[] => {
  const result = postSchema.safeParse(data);
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
