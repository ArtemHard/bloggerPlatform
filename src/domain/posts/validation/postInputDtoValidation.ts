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

  return result.error.issues.map((err) => ({
    field: err.path.join('.'), 
    message: err.message,
  }));
};
