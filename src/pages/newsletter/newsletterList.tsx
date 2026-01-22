import { useState } from "react";
import { useGetSubscribers, useDeleteSubscribers, useGetNewsletterAnalytics, type Subscriber } from "@/services/newsletter";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { useNavigate } from "react-router-dom";
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
import { toast } from "sonner";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";

export default function NewsletterList() {
    const navigate = useNavigate();
    const [pagination, setPagination] = useState({ page: 1, limit: 10 });
    const { data } = useGetSubscribers(pagination.page, pagination.limit);
    const { mutateAsync: deleteSubscribers, isPending: isDeleting } = useDeleteSubscribers();
    const [selectedRows, setSelectedRows] = useState<Subscriber[]>([]);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

    const { user } = useUserStore()
    const handleDelete = async (ids: string[]) => {
        try {
            await deleteSubscribers(ids);
        } catch (error) {
            // Error deleting subscribers
        }
    };

    const handleBulkDelete = async () => {
        try {
            const ids = selectedRows.map((row) => row.id);
            await deleteSubscribers(ids);
            toast.success(`${ids.length} subscriber(s) deleted successfully`);
            setShowBulkDeleteDialog(false);
            setSelectedRows([]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete subscribers");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                <Breadcrumb
                    links={[
                        { label: "Newsletter", href: "/dashboard/newsletter" },
                        { label: "View All", isActive: true }
                    ]}
                />
            </div>



            <div className="">
                <DataTable
                    columns={columns}
                    data={data?.data?.subscriptions || []}
                    onRowSelectionChange={(rows: Subscriber[]) => setSelectedRows(rows)}
                    pagination={{
                        itemsPerPage: pagination.limit,
                        currentPage: pagination.page,
                        totalItems: data?.data?.total || 0,
                        totalPages: data?.data?.totalPages || 1,
                        onPageChange: (page) => setPagination(prev => ({ ...prev, page })),
                        onItemsPerPageChange: (limit) => setPagination(prev => ({ ...prev, limit })),
                        showItemsPerPage: true,
                        showPageInput: true,
                        showPageInfo: true,
                    }}
                    meta={{
                        onDelete: handleDelete
                    }}
                    elements={
                        <div className="flex gap-2">
                            {selectedRows.length > 0 && (
                                <Button
                                    variant="destructive"
                                    className="rounded-sm hover:shadow-md transition-shadow"
                                    onClick={() => setShowBulkDeleteDialog(true)}
                                >
                                    <Icon
                                        icon="solar:trash-bin-minimalistic-bold"
                                        className="mr-2"
                                        width="20"
                                    />
                                    delete ({selectedRows.length})
                                </Button>
                            )}
                            {user?.role == UserRole.SUDOADMIN && (
                                <Button
                                    variant="destructive"
                                    onClick={() => navigate("/dashboard/newsletter/deleted")}
                                >
                                    <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                                    View Deleted
                                </Button>
                            )}
                        </div>
                    }
                />
            </div>

            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>delete Subscribers?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedRows.length} selected subscriber(s)? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
