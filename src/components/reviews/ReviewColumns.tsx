import type { ColumnDef } from "@tanstack/react-table";
import type { IReview } from "@/types/IReview";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash, Edit, Star, Eye } from "lucide-react";

interface ReviewColumnProps {
    onView: (review: IReview) => void;
    onEdit: (review: IReview) => void;
    onDelete: (id: string) => void;
    isSudoAdmin?: boolean;
}

export const createReviewColumns = ({
    onView,
    onEdit,
    onDelete,
}: ReviewColumnProps): ColumnDef<IReview>[] => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "reviewerName",
            header: "Reviewer",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium text-zinc-900">{row.original.reviewerName}</span>
                    <span className="text-xs text-zinc-500">{row.original.reviewerEmail}</span>
                </div>
            ),
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => (
                <span className="font-medium">{row.original.title}</span>
            ),
        },
        {
            accessorKey: "rating",
            header: "Rating",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            size={14}
                            className={i < row.original.rating ? "fill-yellow-400 text-yellow-400" : "text-zinc-300"}
                        />
                    ))}
                    <span className="ml-1 text-sm text-zinc-600">({row.original.rating})</span>
                </div>
            ),
        },
        {
            accessorKey: "comment",
            header: "Comment",
            cell: ({ row }) => (
                <p className="max-w-[300px] truncate text-sm text-zinc-600" title={row.original.comment}>
                    {row.original.comment}
                </p>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => (
                <span className="text-sm text-zinc-600">
                    {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
                </span>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const review = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-zinc-100">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => onView(review)}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => onEdit(review)}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer text-red-600 focus:text-red-500"
                                onClick={() => onDelete(review._id)}
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
