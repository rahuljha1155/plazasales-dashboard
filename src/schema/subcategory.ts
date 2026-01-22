import { z } from 'zod';

export const subcategoryFormSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  
  slug: z.string()
    .min(1, "Slug is required")
    .max(255, "Slug must be less than 255 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),
  
  categoryId: z.string()
    .uuid("Category ID must be a valid UUID"),
  
  coverImage: z.any().optional()
});

// Type inference
export type SubcategoryFormData = z.infer<typeof subcategoryFormSchema>;
