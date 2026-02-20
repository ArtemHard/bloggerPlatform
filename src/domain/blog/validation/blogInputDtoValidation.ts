import { ValidationError } from '../../../core/types/validationError';
import { BlogInputDto } from '../dto/blog.input-dto';
import { blogSchema } from './shemas/blog-shema';

export const blogInputDtoValidation = (
  data: BlogInputDto,
): ValidationError[] => {
  const result = blogSchema.safeParse(data);
  if (result.success) {
    return [];
  }
// console.log('>>>>',result.error.issues);

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
