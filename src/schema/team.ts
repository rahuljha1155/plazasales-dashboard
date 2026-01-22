import { z } from 'zod';

export const postTeamSchema = z.object({
  addToHome: z.string().optional(), // Note: I corrected the key name from "addTol-ome"
  fullname: z.string().min(1, "Full name is required"),
  designation: z.string().min(1, "Designation is required"),
  countryCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  image: z.string().optional(), // For file name/path
  isLeader: z.string().optional(),
  description: z.any().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
});

export type PostTeamData = z.infer<typeof postTeamSchema>;
