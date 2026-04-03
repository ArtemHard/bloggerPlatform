import z from 'zod';

export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Email must be a valid email address' })
    .regex(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, {
      message: 'Email must be a valid format (e.g. example@example.dev)',
    }),
});
