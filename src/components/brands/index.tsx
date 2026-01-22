import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(1, {
    message: "Package Name is required.",
  }),
  description: z.string().optional(),

  slug: z.string().min(1, {
    message: "Slug is required.",
  }),
  image: z.any().refine((files) => files && files.length > 0, {
    message: "Image is required.",
  }),
  categoryId: z.coerce.string(),
});
