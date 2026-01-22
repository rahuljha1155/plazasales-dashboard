import { z } from "zod";

const nonEmptyString = (fieldName: string) => z.string().min(1, { message: `${fieldName} is required` }).trim();
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;


export const PostBrandSchema = z.object({
  name: nonEmptyString("name"),
  slug: nonEmptyString("slug").regex(slugRegex, {
    message: "slug must be lowercase, alphanumeric and may contain single dashes",
  }),
  themeColor: z
    .string()
    .regex(hexColorRegex, { message: "themeColor must be a hex color like #RRGGBB" }),
  description: z
    .string()
    .max(2000, { message: "description too long (max 2000 chars)" })
    .optional()
    .or(z.literal("")),
  isAuthorizedDistributor: z.boolean().default(false),
  usp: z.string().optional(),
  certificate: z
    .string()
    .optional()
    .refine((val) => !val || val === "file" || z.string().url().safeParse(val).success, {
      message: "certificate must be a valid URL",
    }),
  logoUrl: z
    .string()
    .min(1, { message: "Logo is required" })
    .refine((val) => val === "file" || z.string().url().safeParse(val).success, {
      message: "logoUrl must be a valid URL",
    }),
  bannerUrls: z
    .array(z.string())
    .min(1, { message: "at least one banner image is required" })
    .max(5, { message: "no more than 5 banner images allowed" })
    .refine((urls) => urls.every((url) => url === "file" || z.string().url().safeParse(url).success), {
      message: "each banner must be a valid URL",
    }),
  indoorImage: z
    .string()
    .optional()
    .refine((val) => !val || val === "file" || z.string().url().safeParse(val).success, {
      message: "indoorImage must be a valid URL",
    }),
  outdoorImage: z
    .string()
    .optional()
    .refine((val) => !val || val === "file" || z.string().url().safeParse(val).success, {
      message: "outdoorImage must be a valid URL",
    }),
  brandImageUrls: z
    .string()
    .optional()
    .refine((val) => !val || val === "file" || z.string().url().safeParse(val).success, {
      message: "brandImageUrls must be a valid URL",
    }),
  playStoreUrl: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "playStoreUrl must be a valid URL",
    }),
  appStoreUrl: z
    .string()
    .optional()
    .refine((val) => !val || z.string().url().safeParse(val).success, {
      message: "appStoreUrl must be a valid URL",
    }),
});

export type IPostBrand = z.infer<typeof PostBrandSchema>;
