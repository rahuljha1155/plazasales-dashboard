import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Star, User, Calendar, MessageSquare, Mail, Quote } from "lucide-react";
import type { IReview } from "@/types/IReview";

interface ReviewViewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    review: IReview | null;
}

export default function ReviewViewDialog({
    isOpen,
    onClose,
    review,
}: ReviewViewDialogProps) {
    if (!review) return null;

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                size={18}
                className={index < rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-200"}
            />
        ));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex justify-between items-center pr-6">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-primary" />
                            Review Details
                        </DialogTitle>
                        <Badge variant={review.rating >= 4 ? "default" : "secondary"} className={review.rating >= 4 ? "bg-green-100 text-green-700" : ""}>
                            {review.rating >= 4 ? "Positive" : review.rating >= 3 ? "Neutral" : "Negative"}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Reviewer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 p-4 rounded-lg border border-zinc-100">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-zinc-500">
                                <User size={16} />
                                <span className="text-sm font-medium">Reviewer</span>
                            </div>
                            <p className="font-semibold text-zinc-900">{review.reviewerName}</p>

                            <div className="flex items-center gap-2 text-zinc-500 pt-1">
                                <Mail size={16} />
                                <span className="text-sm">{review.reviewerEmail}</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-zinc-500">
                                <Calendar size={16} />
                                <span className="text-sm font-medium">Date Submitted</span>
                            </div>
                            <p className="font-medium text-zinc-900">
                                {format(new Date(review.createdAt), "MMMM dd, yyyy")}
                            </p>
                            <p className="text-xs text-zinc-400 italic">
                                Last updated: {format(new Date(review.updatedAt), "MMM dd, hh:mm a")}
                            </p>
                        </div>
                    </div>

                    <Separator className="bg-zinc-100" />

                    {/* Review Content */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-zinc-900">{review.title}</h3>
                            <div className="flex items-center gap-1">
                                {renderStars(review.rating)}
                            </div>
                        </div>

                        <div className="relative bg-white p-6 rounded-lg border border-zinc-100 shadow-sm italic text-zinc-700 leading-relaxed">
                            <Quote className="absolute -top-3 -left-1 h-8 w-8 text-zinc-100 -z-10 fill-zinc-50" />
                            "{review.comment}"
                        </div>
                    </div>

                    {/* Rating Summary */}
                    <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-lg border border-primary/10">
                        <div className="text-3xl font-black text-primary">{review.rating}</div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-900">
                                {review.rating === 5 ? "Exceptional" : review.rating >= 4 ? "Very Good" : review.rating >= 3 ? "Satisfactory" : "Needs Improvement"}
                            </span>
                            <span className="text-xs text-zinc-500">Out of 5 star rating scale</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
