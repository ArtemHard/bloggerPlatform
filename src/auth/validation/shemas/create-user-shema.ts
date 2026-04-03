import z from 'zod';

export const createUserSchema = z.object({
  login: z
    .string()
    .min(3, { message: 'Login must be at least 3 characters long' })
    .max(10, { message: 'Login must not exceed 10 characters' })
    .regex(/^[a-zA-Z0-9_-]*$/, {
      message: 'Login can only contain letters, numbers, underscores, and hyphens',
    }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(20, { message: 'Password must not exceed 20 characters' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Email must be a valid email address' })
    .regex(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, {
      message: 'Email must be a valid format (e.g. example@example.dev)',
    }),
});

