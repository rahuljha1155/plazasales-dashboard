import { z } from "zod";

export const sellingPointSchema = z.object({
  brandId: z.string().uuid("Please select a valid brand"),
  title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
  subtitle: z.string().min(1, "Subtitle is required").max(500, "Subtitle must be less than 500 characters"),
  icon: z.union([
    z.string().url("Please provide a valid URL"),
    z.instanceof(File, { message: "Please upload an icon" }),
  ]),
  sortOrder: z.number().int().min(0).optional(),
});

export type SellingPointFormData = z.infer<typeof sellingPointSchema>;
