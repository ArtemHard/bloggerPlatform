import z from "zod";

export const userSchema = z.object({
  login: z
    .string()
    .trim()
    .min(3, { message: 'Login must be at least 3 characters long' })
    .max(10, { message: 'Login must be at most 10 characters long' })
    .regex(/^[a-zA-Z0-9_-]*$/, {
      message: 'Login must contain only letters, numbers, underscores, and hyphens',
    }),
  password: z
    .string()
    .trim()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .max(20, { message: 'Password must be at most 20 characters long' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Email must be a valid email address' })
    .regex(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, {
      message: 'Email must be a valid format (e.g. example@example.dev)',
    }),
});