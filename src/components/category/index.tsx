import { z } from "zod";

export { CategoryForm } from "./CategoryForm";
export { CategoryViewModal } from "./CategoryViewModal";
export { default as CategoryList } from "./categoryList";

export type FormValues = {
  name: string;
  slug: string;
  description: string;
  addToHome: boolean;
  sortOrder: string;
  image: any;
};

export const formSchema = z.object({
  name: z.string().min(1, {
    message: "Collection is required.",
  }),
  slug: z.string().min(1, {
    message: "Slug is required.",
  }),
  description: z.string().default(""),
  addToHome: z.boolean().default(false),
  sortOrder: z.string().default('0'),
  image: z.any().refine((files) => files && files.length > 0, {
      message: "Image is required.",
    }),
});