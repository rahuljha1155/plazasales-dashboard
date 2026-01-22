import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TableShimmer } from "@/components/table-shimmer";
import { DataTable } from "../ui/data-table";
import { useGetDeletedMembers, useRecoverMembers, useDestroyMemberPermanently } from "@/services/teammember";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { createDeletedMemberColumns } from "./DeletedMemberTableColumns";
import type { IDeletedMember } from "@/types/ITeammember";
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

export default function DeletedMemberList() {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        limit: 10,
    });

    const [selectedRows, setSelectedRows] = useState<IDeletedMember[]>([]);

    const { data, isLoading } = useGetDeletedMembers(pagination.page, pagination.limit);
    const { mutateAsync: recoverMembers, isPending: isRecoverPending } = useRecoverMembers();
    const { mutateAsync: destroyMemberPermanently, isPending: isDestroyPending } = useDestroyMemberPermanently();

    // Check if user is sudo admin
    const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

    // Redirect if not sudo admin
    if (!isSudoAdmin && !isLoading) {
        navigate("/dashboard/team-members");
        toast.error("Access denied. Only sudo admins can access this page.");
        return null;
    }

    const handleRecover = async (id: string) => {
        try {
            await recoverMembers([id]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleRecoverAll = async () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one member to recover");
            return;
        }

        try {
            const ids = selectedRows.map((member) => member.id);
            await recoverMembers(ids);
            setSelectedRows([]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleRecoverAllMembers = async () => {
        if (!data?.data?.members || data.data.members.length === 0) {
            toast.error("No deleted members to recover");
            return;
        }

        try {
            const ids = data.data.members.map((member: any) => member.id);
            await recoverMembers(ids);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleDestroyPermanently = async (id: string) => {
        try {
            await destroyMemberPermanently(id);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleDestroySelected = async () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one member to delete");
            return;
        }

        try {
            const ids = selectedRows.map((member) => member.id).join(",");
            await destroyMemberPermanently(ids);
            setSelectedRows([]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const columns = createDeletedMemberColumns({
        onRecover: handleRecover,
        onDestroyPermanently: handleDestroyPermanently,
        isRecoverPending,
        isDestroyPending,
    });

    const tableData = (data?.data.members || []).map((member: any) => ({
        ...member,
        _id: member.id,
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
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">

                <Breadcrumb
                    links={[
                        { label: "Team Members", isActive: false, href: "/dashboard/team-members" },
                        { label: "Deleted Members", isActive: true },
                    ]}
                />
            </div>



            {/* Table Section */}
            <div className="bg-white">
                <DataTable
                    columns={columns as any}
                    data={tableData}
                    onRowSelectionChange={setSelectedRows}
                    filterColumn="fullname"
                    filterPlaceholder="Search deleted members by name..."
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
                                            variant="destructive"
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
                                                        Delete Members
                                                    </AlertDialogTitle>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {selectedRows.length} member(s)
                                                    </p>
                                                </div>
                                            </div>
                                            <AlertDialogDescription className="text-gray-600">
                                                This will permanently delete the selected members. This action cannot be undone. Are you sure you want to proceed?
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

                            {tableData.length > 0 && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            className="rounded-sm bg-green-600 hover:bg-green-700 hover:shadow-md transition-shadow"
                                            disabled={isRecoverPending}
                                        >
                                            <Icon icon="solar:refresh-bold" className="mr-2" width="20" />
                                            Recover All
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="max-w-md">
                                        <AlertDialogHeader>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                                    <Icon
                                                        icon="solar:refresh-bold"
                                                        className="text-green-600"
                                                        width="24"
                                                    />
                                                </div>
                                                <div>
                                                    <AlertDialogTitle className="text-lg">
                                                        Recover All Members
                                                    </AlertDialogTitle>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {data?.data.total} member(s)
                                                    </p>
                                                </div>
                                            </div>
                                            <AlertDialogDescription className="text-gray-600">
                                                This will restore all {data?.data.total} deleted members and make them available again in the system. Are you sure you want to proceed?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-lg">
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-green-500 hover:bg-green-600 rounded-lg"
                                                onClick={handleRecoverAllMembers}
                                            >
                                                <Icon icon="solar:refresh-bold" className="mr-2" width="16" />
                                                Recover All
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    }
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
