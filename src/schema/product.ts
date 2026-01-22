import { z } from 'zod';

// Product Type Enum (must match backend values)
export enum ProductType {
  PHYSICAL = "PHYSICAL",
  DIGITAL = "DIGITAL",
  SERVICE = "SERVICE",
  SAAS = "SAAS"
}

// Schema for SaaS package features
export const saasPackageSchema = z.object({
  title: z.string().min(1, "Package title is required"),
  price: z.number().min(0, "Price must be positive"),
  yearlyDiscount: z.number().min(0).max(100, "Discount must be between 0-100"),
  features: z.array(z.string()).min(1, "At least one feature is required")
});

// Schema for SaaS features (conditional validation will be handled in superRefine)
export const saasFeaturesSchema = z.object({
  title: z.string().optional(),
  shortDesc: z.string().optional(),
  packages: z.array(saasPackageSchema).optional()
});

export const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  model: z.string().optional(),
  price: z.string().optional(), // Can be string or number
  mrp: z.string().optional().or(z.number().optional()), // Market price, optional
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  technology: z.string().optional(),
  feature: z.string().optional(), // For non-SaaS products (rich text) or JSON string for SaaS demo plans
  saasFeatures: saasFeaturesSchema.optional(), // For SaaS products
  metaTitle: z.string().optional(),
  metatag: z.array(z.string()).optional(), // Multiple metalag values
  metadescription: z.string().optional(),
  isPublished: z.union([ z.literal('true'), z.literal('false'), z.boolean()]).transform(val => val === 'true' || val === true),
  isPopular: z.union([
    z.literal('true'),
    z.literal('false'),
    z.boolean()
  ]).transform(val => val === 'true' || val === true),
  productType: z.nativeEnum(ProductType, {
    required_error: "Product type is required",
    invalid_type_error: "Invalid product type",
  }),
  brandId: z.string().uuid("Brand ID must be a valid UUID"),
  subcategoryId: z.string().uuid("Subcategory ID must be a valid UUID"),
  coverImage: z.instanceof(File).optional(),
  detailImage: z.array(z.instanceof(File)).max(10, "Maximum 10 detail images allowed").optional(),
  icons: z.array(z.instanceof(File)).optional()
}).superRefine((data, ctx) => {
  // Only validate saasFeatures if it exists AND has content (indicating it's being used)
  // For SAAS products with non-SaaS brands, demoPlans can be used instead
  if (data.productType === ProductType.SAAS && data.saasFeatures) {
    // Only validate if saasFeatures is actually being used (has title or shortDesc or packages)
    const isSaasFeaturesInUse = data.saasFeatures.title || data.saasFeatures.shortDesc ||
      (data.saasFeatures.packages && data.saasFeatures.packages.length > 0);

    if (isSaasFeaturesInUse) {
  // Validate saasFeatures fields when they are in use
      if (!data.saasFeatures.title || data.saasFeatures.title.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Feature title is required",
          path: ["saasFeatures", "title"]
        });
      }
      if (!data.saasFeatures.shortDesc || data.saasFeatures.shortDesc.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Short description is required",
          path: ["saasFeatures", "shortDesc"]
        });
      }
      if (!data.saasFeatures.packages || data.saasFeatures.packages.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one package is required. Click 'Add Package' button to add a package.",
          path: ["saasFeatures", "packages"]
        });
      } else {
        // Validate each package
        data.saasFeatures.packages.forEach((pkg, index) => {
          if (!pkg.title || pkg.title.trim() === "") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Package title is required",
              path: ["saasFeatures", "packages", index, "title"]
            });
          }
          if (pkg.price < 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Price must be positive",
              path: ["saasFeatures", "packages", index, "price"]
            });
          }
          if (pkg.yearlyDiscount < 0 || pkg.yearlyDiscount > 100) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Discount must be between 0-100",
              path: ["saasFeatures", "packages", index, "yearlyDiscount"]
            });
          }
          if (!pkg.features || pkg.features.length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "At least one feature is required",
              path: ["saasFeatures", "packages", index, "features"]
            });
          }
        });
      }
    }
  }
});

// Demo Plan type (not validated by zod, just for form structure)
export interface DemoPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

// Type inference
export type ProductFormData = z.infer<typeof productFormSchema>;
export type SaasPackage = z.infer<typeof saasPackageSchema>;
export type SaasFeatures = z.infer<typeof saasFeaturesSchema>;
