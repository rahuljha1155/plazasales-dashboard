import { useState } from "react";
import {
    useGetDeletedReviews,
    useRecoverReviews,
    useDestroyReviewPermanently,
} from "@/services/review";
import type { IReview } from "@/types/IReview";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
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
import { MoreHorizontal, RotateCcw, Trash2, Star, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Breadcrumb from "../dashboard/Breadcumb";
import ReviewViewDialog from "./ReviewViewDialog";

export default function DeletedReviewList() {
    const { data, isLoading } = useGetDeletedReviews();
    const { mutateAsync: recoverReviews } = useRecoverReviews();
    const { mutateAsync: destroyPermanently } = useDestroyReviewPermanently();

    const [selectedRows, setSelectedRows] = useState<IReview[]>([]);
    const [destroyId, setDestroyId] = useState<string | null>(null);
    const [showBulkRecoverDialog, setShowBulkRecoverDialog] = useState(false);
    const [selectedReview, setSelectedReview] = useState<IReview | null>(null);
    const [showViewDialog, setShowViewDialog] = useState(false);

    const handleView = (review: IReview) => {
        setSelectedReview(review);
        setShowViewDialog(true);
    };

    const handleRecover = async (ids: string[]) => {
        try {
            await recoverReviews(ids);
            setSelectedRows([]);
        } catch (error) {
            // Error handled in service
        }
    };

    const handleDestroy = async () => {
        if (!destroyId) return;
        try {
            await destroyPermanently(destroyId);
            setDestroyId(null);
        } catch (error) {
            // Error handled in service
        }
    };

    const columns: ColumnDef<IReview>[] = [
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
                    <span className="font-medium">{row.original.reviewerName}</span>
                    <span className="text-xs text-zinc-500">{row.original.reviewerEmail}</span>
                </div>
            ),
        },
        {
            accessorKey: "title",
            header: "Title",
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
                </div>
            ),
        },
        {
            accessorKey: "deletedAt",
            header: "Deleted Date",
            cell: ({ row }) => (
                <span className="text-sm">
                    {row.original.updatedAt ? format(new Date(row.original.updatedAt), "MMM dd, yyyy") : "N/A"}
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
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleView(review)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRecover([review._id])}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Recover
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDestroyId(review._id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Permanent Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const breadcrumbLinks = [
        { label: "Reviews", href: "/dashboard/reviews" },
        { label: "Deleted Reviews", isActive: true },
    ];

    return (
        <div className="space-y-6">
            <Breadcrumb links={breadcrumbLinks} />
            <Card className="p-0">
                <CardContent className="p-2">
                    {isLoading ? (
                        <div className="space-y-1">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-12 bg-gray-100 animate-pulse rounded"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xs">
                            <DataTable
                                columns={columns}
                                data={data?.data || []}
                                onRowClick={handleView}
                                onRowSelectionChange={(rows: any) => setSelectedRows(rows)}
                                pagination={{
                                    currentPage: 1,
                                    totalPages: 1,
                                    totalItems: data?.data?.length || 0,
                                    itemsPerPage: 10,
                                    onPageChange: () => { },
                                }}
                                elements={
                                    <div className="flex gap-2">
                                        {selectedRows.length > 0 && (
                                            <Button
                                                variant="outline"
                                                className="rounded-sm border-green-500 text-green-600 hover:bg-green-50"
                                                onClick={() => setShowBulkRecoverDialog(true)}
                                            >
                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                Recover Selected ({selectedRows.length})
                                            </Button>
                                        )}
                                    </div>
                                }
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={!!destroyId} onOpenChange={() => setDestroyId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanent Delete?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The review will be permanently
                            removed from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDestroy}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={showBulkRecoverDialog}
                onOpenChange={setShowBulkRecoverDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Recover Selected Items?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to recover {selectedRows.length} selected
                            item(s)?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                handleRecover(selectedRows.map((r) => r._id));
                                setShowBulkRecoverDialog(false);
                            }}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            Recover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ReviewViewDialog
                isOpen={showViewDialog}
                onClose={() => setShowViewDialog(false)}
                review={selectedReview}
            />
        </div>
    );
}
