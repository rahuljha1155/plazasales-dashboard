import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGetAllReviews, useDeleteReviews } from "@/services/review";
import type { IReview } from "@/types/IReview";
import { DataTable } from "@/components/ui/data-table";
import { createReviewColumns } from "./ReviewColumns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import Breadcrumb from "../dashboard/Breadcumb";
import ReviewDialog from "./ReviewDialog";
import ReviewViewDialog from "./ReviewViewDialog";

export default function ReviewList() {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

    const { data, isLoading } = useGetAllReviews();
    const { mutateAsync: deleteReviews } = useDeleteReviews();

    const [selectedRows, setSelectedRows] = useState<IReview[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [showSheet, setShowSheet] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [selectedReview, setSelectedReview] = useState<IReview | null>(null);

    const handleView = (review: IReview) => {
        setSelectedReview(review);
        setShowViewDialog(true);
    };

    const handleEdit = (review: IReview) => {
        setSelectedReview(review);
        setShowSheet(true);
    };

    const handleAddNew = () => {
        setSelectedReview(null);
        setShowSheet(true);
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await deleteReviews(deleteId);
            setDeleteId(null);
        } catch (error) {
            // Error handled in service
        }
    };

    const handleBulkDelete = async () => {
        try {
            const ids = selectedRows.map((row) => row._id).join(",");
            await deleteReviews(ids);
            setShowBulkDeleteDialog(false);
            setSelectedRows([]);
        } catch (error) {
            // Error handled in service
        }
    };

    const breadcrumbLinks = [{ label: "Reviews", isActive: true }];

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
                                columns={createReviewColumns({
                                    onView: handleView,
                                    onEdit: handleEdit,
                                    onDelete: (id) => setDeleteId(id),
                                    isSudoAdmin,
                                })}
                                onRowClick={handleView}
                                data={data?.data || []}
                                onRowSelectionChange={(rows: any) => setSelectedRows(rows)}
                                elements={
                                    <div className="flex gap-2">
                                        {selectedRows.length > 0 && (
                                            <Button
                                                variant="destructive"
                                                className="rounded-sm"
                                                onClick={() => setShowBulkDeleteDialog(true)}
                                            >
                                                <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                                                delete ({selectedRows.length})
                                            </Button>
                                        )}
                                        {isSudoAdmin && (
                                            <Button
                                                variant="destructive"
                                                onClick={() => navigate("/dashboard/reviews/deleted")}
                                            >
                                                <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4 mr-2" />
                                                View Deleted
                                            </Button>
                                        )}
                                        <Button
                                            className="rounded-sm"
                                            onClick={handleAddNew}
                                        >
                                            <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
                                            Add Review
                                        </Button>
                                    </div>
                                }
                                pagination={{
                                    currentPage: data?.pagination?.currentPage || 1,
                                    totalPages: data?.pagination?.totalPages || 1,
                                    totalItems: data?.pagination?.total || 0,
                                    itemsPerPage: data?.pagination?.itemsPerPage || 10,
                                    onPageChange: (page) => {
                                        // Implement page change if the API supports it
                                    }
                                }}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <ReviewDialog
                open={showSheet}
                onOpenChange={setShowSheet}
                review={selectedReview}
            />

            <ReviewViewDialog
                isOpen={showViewDialog}
                onClose={() => setShowViewDialog(false)}
                review={selectedReview}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This item will be moved to the trash. You can recover it later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={showBulkDeleteDialog}
                onOpenChange={setShowBulkDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>delete Items?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedRows.length} selected
                            item(s)?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
