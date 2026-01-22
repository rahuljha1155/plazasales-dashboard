import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TableShimmer } from "@/components/table-shimmer";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import {
    useGetDeletedCareers,
    useRecoverCareers,
    useDestroyCareerPermanently,
} from "@/services/career";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
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
import Breadcrumb from "@/components/dashboard/Breadcumb";

type DeletedCareer = {
    id: string;
    title: string;
    slug: string | null;
    location: string;
    jobType: string;
    salaryRange: string;
};

export default function DeletedCareersList() {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [pagination, setPagination] = useState({ page: 1, limit: 10 });
    const [selectedRows, setSelectedRows] = useState<DeletedCareer[]>([]);
    const [careerToDelete, setCareerToDelete] = useState<string | null>(null);

    const { data, isLoading } = useGetDeletedCareers(pagination.page, pagination.limit);
    const { mutateAsync: recoverCareers, isPending: isRecovering } = useRecoverCareers();
    const { mutateAsync: destroyCareer, isPending: isDestroying } = useDestroyCareerPermanently();

    const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

    const handleRecover = async (ids?: string[]) => {
        const careersToRecover = ids || selectedRows.map(r => r.id);

        if (careersToRecover.length === 0) {
            toast.error("Please select careers to recover");
            return;
        }

        try {
            await recoverCareers(careersToRecover);
            setSelectedRows([]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to recover careers");
        }
    };

    const handleRecoverAll = async () => {
        const allCareerIds = data?.data?.careers?.map((career: DeletedCareer) => career.id) || [];
        if (allCareerIds.length === 0) {
            toast.error("No careers to recover");
            return;
        }
        await handleRecover(allCareerIds);
    };

    const handlePermanentDelete = async () => {
        if (!careerToDelete) return;

        try {
            await destroyCareer(careerToDelete);
            setCareerToDelete(null);
            setSelectedRows([]);
            toast.success(careerToDelete.includes(",") ? "Careers permanently deleted" : "Career permanently deleted");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete career permanently");
        }
    };

    const handleDestroySelected = () => {
        if (selectedRows.length === 0) return;
        setCareerToDelete(selectedRows.map(r => r.id).join(","));
    };

    const columns: ColumnDef<DeletedCareer>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="ml-2"
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
            accessorKey: "title",
            header: "Title",
        },
        {
            accessorKey: "location",
            header: "Location",
        },
        {
            accessorKey: "jobType",
            header: "Job Type",
            cell: ({ row }) => (
                <span className="capitalize">{row.original.jobType.replace("_", " ").toLowerCase()}</span>
            ),
        },
        {
            accessorKey: "salaryRange",
            header: "Salary Range",
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecover([row.original.id])}
                        disabled={isRecovering}
                        className="hover:bg-green-50 hover:border-green-500 hover:text-green-600"
                    >
                        <Icon icon="solar:refresh-bold" width="16" className="mr-1" />
                        Recover
                    </Button>
                    {isSudoAdmin && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCareerToDelete(row.original.id)}
                            className="rounded-sm text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-600 transition-colors"
                            disabled={isDestroying}
                        >
                            <Icon icon="solar:trash-bin-trash-bold" className="mr-1.5" width="16" />
                            Delete Forever
                        </Button>

                    )}
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <TableShimmer />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">

            <Breadcrumb links={[
                {
                    label: "Careers",
                    href: "/dashboard/career",
                },
                {
                    label: "Deleted Careers",
                    isActive: true,
                },
            ]} />

            <div className="bg-white">
                <DataTable
                    columns={columns}
                    data={data?.data?.careers || []}
                    filterColumn="title"
                    filterPlaceholder="Search careers by title..."
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
                    elements={
                        <div className="flex gap-2">
                            {data?.data?.careers && data.data.careers.length > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={handleRecoverAll}
                                    disabled={isRecovering}
                                    className="hover:bg-green-50 hover:border-green-500 hover:text-green-600"
                                >
                                    <Icon icon="solar:refresh-bold" className="mr-2" width="20" />
                                    Recover All
                                </Button>
                            )}
                            {selectedRows.length > 0 && (
                                <>
                                    <Button
                                        variant="default"
                                        onClick={() => handleRecover()}
                                        disabled={isRecovering}
                                    >
                                        <Icon icon="solar:refresh-bold" className="mr-2" width="20" />
                                        Recover Selected ({selectedRows.length})
                                    </Button>
                                    {isSudoAdmin && (
                                        <Button
                                            variant="destructive"
                                            onClick={handleDestroySelected}
                                            disabled={isDestroying}
                                        >
                                            <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="20" />
                                            delete ({selectedRows.length})
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    }
                    onRowSelectionChange={setSelectedRows}
                />
            </div>

            <AlertDialog open={!!careerToDelete} onOpenChange={() => setCareerToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the {careerToDelete?.includes(",") ? "selected careers" : "career"}
                            from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handlePermanentDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
