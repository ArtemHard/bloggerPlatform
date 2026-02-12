import { ValidationError } from '../../../core/types/validationError';
import { BlogInputDto } from '../dto/blog.input-dto';
import { blogSchema } from './shemas/blog-shema';
import { Resolution } from './types/video';

export const blogInputDtoValidation = (
  data: BlogInputDto,
): ValidationError[] => {
  const result = blogSchema.safeParse(data);
  if (result.success) {
    return [];
  }

  return result.error.issues.map((err) => ({
    field: err.path.join('.'), 
    message: err.message,
  }));
};
