import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TableShimmer } from "@/components/table-shimmer";
import { DataTable } from "../ui/data-table";
import { useGetDeletedContacts, useRecoverContacts, useDestroyContactPermanently } from "@/hooks/useContact";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { createDeletedContactColumns } from "./DeletedContactTableColumns";
import type { IContact } from "@/types/Icontact";
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PaginationState {
    page: number;
    limit: number;
}

export default function DeletedContactList() {
    const navigate = useNavigate();
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        limit: 10,
    });

    const [selectedRows, setSelectedRows] = useState<IContact[]>([]);

    const { data, isLoading } = useGetDeletedContacts(pagination.page, pagination.limit);
    const { mutateAsync: recoverContacts, isPending: isRecoverPending } = useRecoverContacts();
    const { mutateAsync: destroyContactPermanently, isPending: isDestroyPending } = useDestroyContactPermanently();

    const handleRecover = async (id: string) => {
        try {
            await recoverContacts([id]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleRecoverAll = async () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one contact to recover");
            return;
        }

        try {
            const ids = selectedRows.map((contact) => contact.id);
            await recoverContacts(ids);
            setSelectedRows([]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleRecoverAllContacts = async () => {
        if (!data?.data?.contacts || data.data.contacts.length === 0) {
            toast.error("No deleted contacts to recover");
            return;
        }

        try {
            const ids = data.data.contacts.map((contact: any) => contact.id);
            await recoverContacts(ids);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleDestroyPermanently = async (id: string) => {
        try {
            await destroyContactPermanently(id);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleDestroySelected = async () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one contact to delete");
            return;
        }

        try {
            const ids = selectedRows.map((contact) => contact.id).join(",");
            await destroyContactPermanently(ids);
            setSelectedRows([]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const columns = createDeletedContactColumns({
        onRecover: handleRecover,
        onDestroyPermanently: handleDestroyPermanently,
        isRecoverPending,
        isDestroyPending,
    });

    const tableData = (data?.data?.contacts || []).map((contact: any) => ({
        ...contact,
        _id: contact.id,
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4  ">
                <Breadcrumb
                    links={[
                        { label: "Contacts", isActive: false, href: "/dashboard/inbox" },
                        { label: "Deleted Contacts", isActive: true },
                    ]}
                />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap items-center justify-end">


                <div className="flex gap-2">
                    {selectedRows.length > 0 && (
                        <Button
                            variant="outline"
                            className="rounded-sm hover:shadow-md transition-shadow text-green-600 hover:bg-green-50 hover:border-green-600"
                            onClick={handleRecoverAll}
                            disabled={isRecoverPending}
                        >
                            <Icon icon="solar:refresh-bold" className="mr-2" width="20" />
                            Recover Selected ({selectedRows.length})
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
                                    delete ({selectedRows.length})
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
                                                delete Contacts
                                            </AlertDialogTitle>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {selectedRows.length} contact(s)
                                            </p>
                                        </div>
                                    </div>
                                    <AlertDialogDescription className="text-gray-600">
                                        This will permanently delete the selected contacts. This action cannot be undone. Are you sure you want to proceed?
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
                                        delete
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
                                    Recover All Contacts
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
                                                Recover All Contacts
                                            </AlertDialogTitle>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {data?.data.total} contact(s)
                                            </p>
                                        </div>
                                    </div>
                                    <AlertDialogDescription className="text-gray-600">
                                        This will restore all {data?.data.total} deleted contacts and make them available again in the system. Are you sure you want to proceed?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-lg">
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-green-500 hover:bg-green-600 rounded-lg"
                                        onClick={handleRecoverAllContacts}
                                    >
                                        <Icon icon="solar:refresh-bold" className="mr-2" width="16" />
                                        Recover All
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white">
                <DataTable
                    columns={columns as any}
                    data={tableData}
                    onRowSelectionChange={setSelectedRows}
                    filterColumn="fullname"
                    filterPlaceholder="Search deleted contacts by name..."
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

            {/* Empty State */}
            {!isLoading && tableData.length === 0 && (
                <div className="text-center py-12">
                    <Icon
                        icon="solar:trash-bin-minimalistic-bold"
                        className="mx-auto text-gray-400 mb-4"
                        width="64"
                    />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Deleted Contacts
                    </h3>
                    <p className="text-gray-500 mb-6">
                        There are no deleted contacts at the moment.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => navigate("/dashboard/inbox")}
                    >
                        <Icon icon="solar:arrow-left-bold" className="mr-2" width="20" />
                        Go to Contacts
                    </Button>
                </div>
            )}
        </div>
    );
}
