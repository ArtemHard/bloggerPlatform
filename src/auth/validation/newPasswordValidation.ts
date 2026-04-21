import { ValidationError } from '../../core/types/validationError';
import { z } from 'zod';

export const newPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(6, 'password length should be from 6 to 20 characters')
    .max(20, 'password length should be from 6 to 20 characters')
    .trim(),
  recoveryCode: z
    .string()
    .uuid('Invalid recovery code format'),
});

export const newPasswordInputDtoValidation = (
  data: { newPassword: string; recoveryCode: string },
): ValidationError[] => {
  const result = newPasswordSchema.safeParse(data);
  if (result.success) {
    return [];
  }

  const uniqueErrors = result.error.issues
    .map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))
    .reduce<ValidationError[]>((acc, error) => {
      // Add only if this field doesn't exist yet in the result
      if (!acc.some((e) => e.field === error.field)) {
        acc.push(error);
      }
      return acc;
    }, []);

  return uniqueErrors;
};
