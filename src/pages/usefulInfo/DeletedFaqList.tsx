import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TableShimmer } from "@/components/table-shimmer";
import { DataTable } from "@/components/ui/data-table";
import { useGetDeletedFAQs, useRecoverFAQs, useDestroyFAQPermanently } from "@/hooks/useFaqs";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { createDeletedFaqColumns } from "./DeletedFaqTableColumns";
import type { IFAQ } from "@/types/IFaq";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PaginationState {
    page: number;
    limit: number;
}

interface DeletedFaqListProps {
    onBack?: () => void;
}

export default function DeletedFaqList({ onBack }: DeletedFaqListProps) {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        limit: 10,
    });

    const [selectedRows, setSelectedRows] = useState<IFAQ[]>([]);

    const { data, isLoading } = useGetDeletedFAQs(pagination.page, pagination.limit);
    const { mutateAsync: recoverFaqs, isPending: isRecoverPending } = useRecoverFAQs();
    const { mutateAsync: destroyFaqPermanently, isPending: isDestroyPending } = useDestroyFAQPermanently();

    // Check if user is sudo admin
    const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

    // Redirect if not sudo admin
    if (!isSudoAdmin && !isLoading) {
        // navigate("/dashboard/useful-info"); 
        // Commented out to avoid loop if this component is rendered inside useful-info page.
        // Instead we return null or show unauthorized message. 
        // But typically we should control access at the route level or parent component level.
        // For now, let's just return a message if not sudo admin.
        return <div className="p-4 text-red-500">Access denied. Only sudo admins can access this page.</div>;
    }

    const handleRecover = async (id: string) => {
        try {
            await recoverFaqs([id]);
            toast.success("FAQ recovered successfully");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to recover FAQ");
        }
    };

    const handleRecoverAll = async () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one FAQ to recover");
            return;
        }

        try {
            const ids = selectedRows.map((faq) => faq.id);
            await recoverFaqs(ids);
            toast.success(`${ids.length} FAQ(s) recovered successfully`);
            setSelectedRows([]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to recover FAQs");
        }
    };

    const handleDestroyPermanently = async (id: string) => {
        try {
            await destroyFaqPermanently(id);
            toast.success("FAQ deleted permanently");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete FAQ");
        }
    };

    const handleDestroySelected = async () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one FAQ to delete");
            return;
        }

        try {
            const ids = selectedRows.map((faq) => faq.id).join(",");
            await destroyFaqPermanently(ids);
            toast.success(`${selectedRows.length} FAQ(s) deleted permanently`);
            setSelectedRows([]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete FAQs");
        }
    };

    const columns = createDeletedFaqColumns({
        onRecover: handleRecover,
        onDestroyPermanently: handleDestroyPermanently,
        isRecoverPending,
        isDestroyPending,
    });

    const tableData = (data?.data?.faqs || []).map((faq: any) => ({
        ...faq,
    }));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <TableShimmer />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">
                <Breadcrumb
                    links={[
                        { label: "FAQs", isActive: false, handleClick: onBack ? onBack : () => navigate(-1) },
                        { label: "Deleted FAQs", isActive: true },
                    ]}
                />
            </div>

            <div className="bg-white">
                <DataTable
                    columns={columns}
                    data={tableData}
                    onRowSelectionChange={setSelectedRows}
                    elements={
                        <div className="flex gap-2">
                            {selectedRows.length > 0 && (
                                <Button
                                    variant="outline"
                                    className="rounded-sm hover:shadow-md transition-shadow text-green-600 hover:bg-green-50 hover:border-green-600"
                                    onClick={handleRecoverAll}
                                    disabled={isRecoverPending}
                                >
                                    <Icon icon="solar:refresh-bold" className="mr-2" width="20" />
                                    Recover ({selectedRows.length})
                                </Button>
                            )}

                            {selectedRows.length > 0 && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="rounded-sm hover:shadow-md transition-shadow text-red-600 hover:bg-red-50 hover:border-red-600"
                                            disabled={isDestroyPending}
                                        >
                                            <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="20" />
                                            Delete ({selectedRows.length})
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="max-w-md">
                                        <AlertDialogHeader>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                                    <Icon
                                                        icon="solar:trash-bin-trash-bold"
                                                        className="text-red-600"
                                                        width="24"
                                                    />
                                                </div>
                                                <div>
                                                    <AlertDialogTitle className="text-lg">
                                                        Delete FAQs
                                                    </AlertDialogTitle>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {selectedRows.length} FAQ(s)
                                                    </p>
                                                </div>
                                            </div>
                                            <AlertDialogDescription className="text-gray-600">
                                                This will permanently delete the selected FAQs. This action cannot be undone. Are you sure you want to proceed?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-lg">
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-red-500 hover:bg-red-600 rounded-lg"
                                                onClick={handleDestroySelected}
                                            >
                                                <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    }
                    filterColumn="title"
                    filterPlaceholder="Search deleted FAQs..."
                    pagination={{
                        itemsPerPage: pagination.limit,
                        currentPage: data?.data?.page || 1,
                        totalItems: data?.data?.total || 0,
                        totalPages: data?.data?.totalPages || 1,
                        onPageChange: (page) => {
                            setPagination((prev) => ({ ...prev, page }));
                        },
                        onItemsPerPageChange: (itemsPerPage) => {
                            setPagination({ page: 1, limit: itemsPerPage });
                        },
                        showItemsPerPage: true,
                        showPageInput: true,
                        showPageInfo: true,
                    }}
                />
            </div>
        </div>
    );
}
