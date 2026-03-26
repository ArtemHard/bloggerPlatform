import { z } from 'zod';

export const commentSchema = z.object({
  content: z.string({ message: 'Content must be a string' })
    .min(20, { message: 'Content length must be from 20 to 300 symbols' })
    .max(300, { message: 'Content length must be from 20 to 300 symbols' })
    .trim(),
});