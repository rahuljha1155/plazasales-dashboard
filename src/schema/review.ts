import { z } from "zod";

const nonEmptyString = (fieldName: string) => z.string().min(1, { message: `${fieldName} is required` }).trim();

export const PostReviewSchema = z.object({
    reviewerName: nonEmptyString("Reviewer Name"),
    reviewerEmail: nonEmptyString("Reviewer Email").email({ message: "Invalid email address" }),
    title: nonEmptyString("Title"),
    comment: nonEmptyString("Comment"),
    rating: z.number().min(1, { message: "Rating must be at least 1" }).max(5, { message: "Rating must be at most 5" }),
});

export type IPostReview = z.infer<typeof PostReviewSchema>;
