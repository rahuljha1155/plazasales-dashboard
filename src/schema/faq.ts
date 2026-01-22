import { z } from 'zod';

export const faqDescriptionSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

export const faqSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: faqDescriptionSchema,
  isActive: z.boolean(),
});

// Type inference
export type FAQDescription = z.infer<typeof faqDescriptionSchema>;
export type FAQ = z.infer<typeof faqSchema>;

// Validation functions
export const validateFAQ = (data: unknown): FAQ => {
  return faqSchema.parse(data);
};

export const safeValidateFAQ = (data: unknown) => {
  return faqSchema.safeParse(data);
};

// For partial updates (PATCH requests)
export const faqPartialSchema = faqSchema.partial();
export type FAQUpdate = z.infer<typeof faqPartialSchema>;

// Alternative schema with more structured steps
export const postFaqSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.object({
    introduction: z.string().optional(),
    steps: z.array(z.string()).min(1, "At least one step is required"),
    summary: z.string().optional(),
    additionalInfo: z.string().optional(),
  }),
  isActive: z.boolean().default(true),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type IPostFAQ = z.infer<typeof postFaqSchema>;