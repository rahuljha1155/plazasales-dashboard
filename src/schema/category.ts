import { z } from 'zod';

export const categoryFormSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),

  slug: z.string()
    .min(1, "Slug is required")
    .max(255, "Slug must be less than 255 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),

  brandId: z.string()
    .uuid("Brand ID must be a valid UUID"),

  coverImage: z.union([
    z.instanceof(File)
      .refine((file) => file.size > 0, "Cover image is required")
      .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
      .refine((file) =>
        ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
        "Only JPEG, PNG, and WebP images are allowed"
      ),
    z.undefined()
  ]).optional(),

  description: z.string()
    .min(1, "Description is required")
    .max(1000, "Description must be less than 1000 characters")
});

// Alternative if you're handling file uploads differently:
export const categoryFormSchemaWithOptionalImage = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),

  slug: z.string()
    .min(1, "Slug is required")
    .max(255, "Slug must be less than 255 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),

  brandId: z.string()
    .uuid("Brand ID must be a valid UUID"),

  coverImage: z.any()
    .refine((file) => file instanceof File, "Cover image is required")
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine((file) =>
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      "Only JPEG, PNG, and WebP images are allowed"
    )
});

// For API request body (without File):
export const categoryApiSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  brandId: z.string().uuid(),
  description: z.string().min(1).max(1000),
  // coverImage would be handled separately as file upload
});

// Schema for create mode (image required)
export const categoryCreateSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),

  slug: z.string()
    .min(1, "Slug is required")
    .max(255, "Slug must be less than 255 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),

  brandId: z.string()
    .uuid("Brand ID must be a valid UUID"),

  coverImage: z.instanceof(File)
    .refine((file) => file.size > 0, "Cover image is required")
    .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
    .refine((file) =>
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
      "Only JPEG, PNG, and WebP images are allowed"
    ),

  description: z.string().max(1000, "Description cannot exceet 1000 chars").optional()
});

// Schema for edit mode (image optional)
export const categoryEditSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),

  slug: z.string()
    .min(1, "Slug is required")
    .max(255, "Slug must be less than 255 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens"),

  brandId: z.string()
    .uuid("Brand ID must be a valid UUID"),

  coverImage: z.union([
    z.instanceof(File)
      .refine((file) => file.size > 0, "Cover image is required")
      .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be less than 5MB")
      .refine((file) =>
        ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
        "Only JPEG, PNG, and WebP images are allowed"
      ),
    z.undefined()
  ]).optional(),

  description: z.string().optional()
});

// Type inference
export type CategoryFormData = z.infer<typeof categoryFormSchema>;
export type CategoryCreateData = z.infer<typeof categoryCreateSchema>;
export type CategoryEditData = z.infer<typeof categoryEditSchema>;
export type CategoryApiData = z.infer<typeof categoryApiSchema>;