import { sl } from 'date-fns/locale';
import { z } from 'zod';

export const jobDescriptionSchema = z.object({
  overview: z.string().min(1, "Overview is required"),
  responsibilities: z.array(z.string()).min(1, "At least one responsibility is required"),
});

export const jobPostingSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  department: z.string().min(1, "Department is required"),
  location: z.string().min(1, "Location is required"),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "REMOTE"]),
  description: jobDescriptionSchema,
  requirements: z.string().optional(),
  salaryRange: z.string(),
  isOpen: z.boolean(),
  slug: z.string().min(1, "Slug is required"),
  openDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

// Type inference
export type IJobDescription = z.infer<typeof jobDescriptionSchema>;
export type IJobPosting = z.infer<typeof jobPostingSchema>;

// Validation functions
export const validateJobPosting = (data: unknown): IJobPosting => {
  return jobPostingSchema.parse(data);
};

export const safeValidateJobPosting = (data: unknown) => {
  return jobPostingSchema.safeParse(data);
};

// For partial updates (PATCH requests)
export const jobPostingPartialSchema = jobPostingSchema.partial();
export type JobPostingUpdate = z.infer<typeof jobPostingPartialSchema>;