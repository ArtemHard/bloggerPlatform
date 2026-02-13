import z from "zod";

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title is required' })
    .max(30, { message: 'Title must be at most 30 characters long' }),
  shortDescription: z
    .string()
    .trim()
    .min(1, { message: 'Description is required' })
    .max(100, { message: 'Description must be at most 100 characters long' }),
  content: z
    .string()
    .trim()
    .min(1, { message: 'Content is required' })
    .max(1000, { message: 'Content must be at most 1000 characters long' }),
  blogId: z
    .string()
    .trim()
    .min(1, { message: 'Blog ID is required' }),
});