import { useState } from "react";
import { useGetDeletedSubscribers, useRecoverSubscribers, useDestroySubscribers, type Subscriber } from "@/services/newsletter";
import { DataTable } from "@/components/ui/data-table";
import { deletedColumns } from "./deletedColumns";
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

export default function DeletedNewsletterList() {
    const navigate = useNavigate();
    const [pagination, setPagination] = useState({ page: 1, limit: 10 });
    const { data, isLoading } = useGetDeletedSubscribers(pagination.page, pagination.limit);
    const { mutateAsync: recoverSubscribers, isPending: isRecovering } = useRecoverSubscribers();
    const { mutateAsync: destroySubscribers, isPending: isDestroying } = useDestroySubscribers();
    const [selectedRows, setSelectedRows] = useState<Subscriber[]>([]);
    const [idsToDestroy, setIdsToDestroy] = useState<string[]>([]);

    const handleRecover = async (ids: string[]) => {
        try {
            await recoverSubscribers(ids);
            setSelectedRows([]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to recover subscribers");
        }
    };

    const handleDestroy = async () => {
        if (idsToDestroy.length === 0) return;
        try {
            await destroySubscribers(idsToDestroy);
            setIdsToDestroy([]);
            setSelectedRows([]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to permanently delete subscribers");
        }
    };

    const handleBulkRecover = () => {
        if (selectedRows.length === 0) return;
        handleRecover(selectedRows.map(r => r.id));
    };

    const handleBulkDestroyClick = () => {
        if (selectedRows.length === 0) return;
        setIdsToDestroy(selectedRows.map(r => r.id));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                <Breadcrumb
                    links={[
                        { label: "Newsletter", href: "/dashboard/newsletter" },
                        { label: "View Deleted", isActive: true },
                    ]}
                />
            </div>

            <div className="bg-white ">
                <DataTable
                    columns={deletedColumns}
                    data={data?.data?.subscriptions || []}
                    onRowSelectionChange={setSelectedRows}
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
                        onRecover: handleRecover,
                        onDestroy: (ids: string[]) => {
                            setIdsToDestroy(ids);
                        }
                    }}
                    elements={
                        <div className="flex gap-2">
                            {selectedRows.length > 0 && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="rounded-sm flex gap-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-all "
                                        onClick={handleBulkRecover}
                                        disabled={isRecovering}
                                    >
                                        <Icon icon="solar:refresh-bold" width="18" />
                                        Recover Selected ({selectedRows.length})
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="rounded-sm flex gap-2"
                                        onClick={handleBulkDestroyClick}
                                        disabled={isDestroying}
                                    >
                                        <Icon icon="solar:trash-bin-minimalistic-bold" width="18" />
                                        delete ({selectedRows.length})
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="outline"
                                className="rounded-sm flex gap-3 "
                                onClick={() => navigate("/dashboard/newsletter")}
                            >
                                <Icon icon="iconamoon:arrow-left-1-light" width="20" />
                                Back to List
                            </Button>
                        </div>
                    }
                />
            </div>

            <AlertDialog open={idsToDestroy.length > 0} onOpenChange={(open) => !open && setIdsToDestroy([])}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently Delete Subscribers?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete {idsToDestroy.length} subscriber(s)? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDestroy}
                            disabled={isDestroying}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isDestroying ? "Deleting..." : "Permanently Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
