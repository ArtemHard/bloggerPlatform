import z from "zod";

export const blogSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Name is required' })
    .max(15, { message: 'Name must be at most 15 characters long' }),
  description: z
    .string()
    .trim()
    .min(1, { message: 'Description is required' })
    .max(500, { message: 'Description must be at most 500 characters long' }),
  websiteUrl: z
    .string()
    .trim()
    .min(1, { message: 'Website URL is required' })
    .max(100, { message: 'Website URL must be at most 100 characters long' })
    .regex(
     /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
      {
        message: 'Website URL must be a valid HTTPS URL',
      },
    ),
});
