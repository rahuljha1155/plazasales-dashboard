import { z } from 'zod';

export const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly (lowercase letters, numbers, hyphens)"),
  excerpt: z.string().min(1, "Excerpt is required"),
  description: z.string().min(1, "Description is required"),
  coverImage: z.string().optional(), // File path or URL
  estimatedReadTime: z.string()
    .or(z.number())
    .transform(val => typeof val === 'number' ? val.toString() : val)
    .refine(val => !isNaN(parseInt(val)), "Estimated read time must be a number"),
  isPublished: z.union([
    z.boolean(),
    z.string().transform(val => val === 'true' || val === '1')
  ]).default(false),
  mediaUrls: z.array(z.string()).default([]), // Array of file paths or URLs
});

// Type inference
export type BlogPost = z.infer<typeof blogPostSchema>;

// For form data (including actual files)
export const blogPostFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly"),
  excerpt: z.string().min(1, "Excerpt is required"),
  description: z.string().min(1, "Description is required"),
  coverImage: z.any().optional(),
  estimatedReadTime: z.string()
    .min(1, "Estimated read time is required")
    .refine(val => !isNaN(parseInt(val)) && parseInt(val) > 0, "Estimated read time must be a positive number"),
  isPublished: z.boolean().default(false),
  mediaUtils: z.any().optional(),
});

export type BlogPostFormData = z.infer<typeof blogPostFormSchema>;

// Validation functions
export const validateBlogPost = (data: unknown): BlogPost => {
  return blogPostSchema.parse(data);
};

export const safeValidateBlogPost = (data: unknown) => {
  return blogPostSchema.safeParse(data);
};

// For partial updates
export const blogPostPartialSchema = blogPostSchema.partial();
export type BlogPostUpdate = z.infer<typeof blogPostPartialSchema>;