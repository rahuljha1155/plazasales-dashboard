import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PostReviewSchema } from "@/schema/review";
import type { IPostReview } from "@/schema/review";
import type { IReview } from "@/types/IReview";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useCreateReview, useUpdateReview } from "@/services/review";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    review?: IReview | null;
}

export default function ReviewDialog({
    open,
    onOpenChange,
    review,
}: ReviewDialogProps) {
    const isEditing = !!review;
    const { mutateAsync: createReview, isPending: isCreating } = useCreateReview();
    const { mutateAsync: updateReview, isPending: isUpdating } = useUpdateReview();

    const form = useForm<IPostReview>({
        resolver: zodResolver(PostReviewSchema),
        defaultValues: {
            reviewerName: "",
            reviewerEmail: "",
            title: "",
            comment: "",
            rating: 5,
        },
    });

    useEffect(() => {
        if (review) {
            form.reset({
                reviewerName: review.reviewerName,
                reviewerEmail: review.reviewerEmail,
                title: review.title,
                comment: review.comment,
                rating: review.rating,
            });
        } else {
            form.reset({
                reviewerName: "",
                reviewerEmail: "",
                title: "",
                comment: "",
                rating: 5,
            });
        }
    }, [review, form, open]);

    const onSubmit = async (data: IPostReview) => {
        try {
            if (isEditing && review) {
                await updateReview({ id: review._id, data });
            } else {
                await createReview(data);
            }
            onOpenChange(false);
        } catch (error) {
            // Error handled in service
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[540px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Review" : "Add New Review"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the review details below."
                            : "Fill in the details to create a new review."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="reviewerName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reviewer Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Full Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reviewerEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Reviewer Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Review Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Amazing Product!" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rating</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => field.onChange(star)}
                                                    className="focus:outline-none"
                                                >
                                                    <Star
                                                        className={cn(
                                                            "h-6 w-6 cursor-pointer transition-colors",
                                                            star <= field.value
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-zinc-300"
                                                        )}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comment</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Really satisfied with the quality..."
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={isCreating || isUpdating}
                            >
                                {isCreating || isUpdating ? "Saving..." : "Save Review"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
