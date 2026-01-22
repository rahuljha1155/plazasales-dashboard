import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useGetTechnologies, useDeleteTechnology, useDeleteBulkTechnologies } from "@/services/technology";
import { DataTable } from "@/components/ui/data-table";
import { type ColumnDef } from "@tanstack/react-table";
import { type ITechnology } from "@/types/ITechnology";
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
import { Skeleton } from "@/components/ui/skeleton";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { Checkbox } from "../ui/checkbox";
import { useUserStore } from "@/store/userStore";

export default function TechnologyList() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

    const { data, isLoading } = useGetTechnologies(page, limit);
    const { mutateAsync: deleteBulkTechnologies, isPending: isBulkDeleting } = useDeleteBulkTechnologies();
    const deleteMutation = useDeleteTechnology();

    const { user } = useUserStore()

    const handleBulkDelete = async () => {
        try {
            const ids = selectedRows.map(row => row.id);
            await deleteBulkTechnologies(ids);
            setShowBulkDeleteDialog(false);
            setSelectedRows([]);
        } catch (error: any) {
            // Error deleting technologies
        }
    };

    const handleDelete = async () => {
        if (deleteId) {
            await deleteMutation.mutateAsync(deleteId);
            setDeleteId(null);
        }
    };

    const columns: ColumnDef<ITechnology>[] = [
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
            accessorKey: "id",
            header: () => <span className="">S.N</span>,
            cell: ({ row }) => (
                <span>{row?.index + 1}</span>
            ),
        },
        {
            accessorKey: "coverImage",
            header: "Cover",
            cell: ({ row }) => (
                <img
                    src={row.original.coverImage}
                    alt={row.original.title}
                    className="size-14 object-cover rounded"
                />
            ),
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => <div className="w-[15rem]">
                {row?.original?.title}
            </div>
        },

        {
            accessorKey: "createdAt",
            header: "Created At",
            cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex -mx-4 ">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/dashboard/technology/view/${row.original.id}`)}
                        className="hover:bg-transparent text-zinc-400 hover:text-blue-600 cursor-pointer"
                    >
                        <Icon icon="mdi:eye" width="16" height="16" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/dashboard/technology/edit/${row.original.id}`)}
                        className="hover:bg-transparent text-zinc-400 hover:text-orange-600 cursor-pointer"
                    >
                        <Icon icon="mynaui:edit-one" width="16" height="16" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(row.original.id)}
                        className="hover:bg-transparent text-zinc-400 hover:text-red-500 cursor-pointer"
                    >
                        <Icon icon="ic:baseline-delete" width="16" height="16" />
                    </Button>

                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Breadcrumb
                    links={[
                        { label: "Technologies", },
                        { label: "View All", isActive: true },
                    ]}
                />

            </div>

            <DataTable
                columns={columns}
                data={data?.data?.technologies || []}
                onRowClick={(row) => {
                    navigate(`/dashboard/technology/view/${row.id}`);
                }}
                onRowSelectionChange={(rows: any) => setSelectedRows(rows)}
                elements={
                    <div className="flex gap-2">
                        {selectedRows.length > 0 && (
                            <Button
                                variant="destructive"
                                className="rounded-sm hover:shadow-md transition-shadow"
                                onClick={() => setShowBulkDeleteDialog(true)}
                            >
                                <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                                delete ({selectedRows.length})
                            </Button>
                        )}
                        <div className="flex gap-2">
                            {
                                user?.role === "SUDOADMIN" && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => navigate("/dashboard/technology/deleted")}
                                    >
                                        <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                                        View Deleted
                                    </Button>
                                )
                            }
                            <Button className="rounded-md" onClick={() => navigate("/dashboard/technology/create")}>
                                <Icon icon="solar:add-circle-linear" className="w-4 h-4 mr-2" />
                                New Technology
                            </Button>
                        </div>
                    </div>
                }
                pagination={{
                    currentPage: page,
                    totalPages: data?.data?.totalPages || 0,
                    totalItems: data?.data?.total || 0,
                    itemsPerPage: limit,
                    onPageChange: (newPage) => setPage(newPage),
                }}
            />

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will move the technology to trash. You can recover it later from the deleted items.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>delete Items?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedRows.length} selected item(s)? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={isBulkDeleting}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            {isBulkDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
