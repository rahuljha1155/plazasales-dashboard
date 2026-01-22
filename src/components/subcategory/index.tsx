import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(3, {
    message: " Name must be at least 3 character.",
  }),
  slug: z.string().min(3, {
    message: "Slug must be at least 3 character.",
  }),
  subheading: z.string(),

  coordinates: z.string(),

  mountainRange: z.string(),

  tripcode: z.string(),

  overview: z.string(),
  banner: z.any(),

  routeMap: z.any(),

  gearList: z.any(),
  equipmentList: z.any(),
  tripBrochure: z.any(),

  collections: z.coerce.string().nullable(),
  category: z.coerce.string().nullable(),

  maxElevation: z.string(),
  // walkingPerDay: z.string(),
  accomodation: z.string(),
  duration: z.coerce.number(),
  groupSize: z.string(),

  activity: z.string(),
  physical: z.string(),

  code: z.string().optional(),
  percentage: z.coerce.number().optional(),
  amount: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
  expiration: z.string().optional(),

  isUpcoming: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  showInHero: z.boolean().optional(),
  isBestseller: z.boolean().optional(),

  isFromOldSite: z.boolean().optional(),
  mealsIncluded: z.string().optional(),
  region: z.string().optional(),
  transportation: z.string().optional(),
  startPoint: z.string().optional(),
  endPoint: z.string().optional(),
  essentialInformation: z.string().optional(),
});
