import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
    useGetDeletedTechnologies,
    useRecoverTechnologies,
    useDestroyTechnology,
    useDestroyBulkTechnologies,
} from "@/services/technology";
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
import { Checkbox } from "@/components/ui/checkbox";

export default function DeletedTechnologyList() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [destroyId, setDestroyId] = useState<string | null>(null);
    const [showBulkDestroyDialog, setShowBulkDestroyDialog] = useState(false);
    const [showRecoverAllDialog, setShowRecoverAllDialog] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const { data, isLoading } = useGetDeletedTechnologies(page, limit);
    const recoverMutation = useRecoverTechnologies();
    const destroyMutation = useDestroyTechnology();
    const destroyBulkMutation = useDestroyBulkTechnologies();

    const handleDestroy = async () => {
        if (destroyId) {
            await destroyMutation.mutateAsync(destroyId);
            setDestroyId(null);
        }
    };

    const handleRecover = async () => {
        if (selectedIds.length > 0) {
            await recoverMutation.mutateAsync(selectedIds);
            setSelectedIds([]);
        }
    };

    const handleBulkDestroy = async () => {
        if (selectedIds.length > 0) {
            await destroyBulkMutation.mutateAsync(selectedIds);
            setSelectedIds([]);
            setShowBulkDestroyDialog(false);
        }
    };

    const handleRecoverAll = async () => {
        const allIds = data?.data?.technologies?.map((tech) => tech.id) || [];
        if (allIds.length > 0) {
            await recoverMutation.mutateAsync(allIds);
            setSelectedIds([]);
            setShowRecoverAllDialog(false);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === data?.data?.technologies?.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(data?.data?.technologies?.map((tech) => tech.id) || []);
        }
    };

    const columns: ColumnDef<ITechnology>[] = [
        {
            id: "select",
            header: () => (
                <Checkbox
                    checked={
                        data?.data && data?.data?.technologies?.length > 0 &&
                        selectedIds.length === data?.data?.technologies?.length
                    }
                    onCheckedChange={toggleSelectAll}
                    className="ml-2"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedIds.includes(row.original.id)}
                    onCheckedChange={() => toggleSelection(row.original.id)}
                />
            ),
        },
        {
            accessorKey: "coverImage",
            header: "Cover",
            cell: ({ row }) => (
                <img
                    src={row.original.coverImage}
                    alt={row.original.title}
                    className="w-16 h-16 object-cover rounded"
                />
            ),
        },
        {
            accessorKey: "title",
            header: "Title",
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <div className="max-w-md truncate">{row.original.description}</div>
            ),
        },
        {
            accessorKey: "deletedAt",
            header: "Deleted At",
            cell: ({ row }) =>
                row.original.deletedAt
                    ? new Date(row.original.deletedAt).toLocaleDateString()
                    : "N/A",
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDestroyId(row.original.id)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4" />
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
                        { label: "Technologies", isActive: false, href: "/dashboard/technology" },
                        { label: "Deleted", isActive: true },
                    ]}
                />

            </div>

            <DataTable
                columns={columns}
                data={data?.data?.technologies || []}
                elements={
                    <>
                        {selectedIds.length > 0 && (
                            <>
                                {data?.data?.technologies && data.data.technologies.length > 0 && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowRecoverAllDialog(true)}
                                        className="bg-green-500 text-white hover:bg-white border hover:border-green-500 hover:text-green-500"
                                    >
                                        <Icon icon="solar:refresh-linear" className="w-4 h-4 mr-2" />
                                        Recover All
                                    </Button>
                                )}
                                <Button onClick={handleRecover} variant="outline"
                                    className="text-green-600 hover:text-green-700"
                                >
                                    <Icon icon="solar:refresh-linear" className="w-4 h-4 mr-2" />
                                    Recover Selected ({selectedIds.length})
                                </Button>
                                <Button
                                    onClick={() => setShowBulkDestroyDialog(true)}
                                    variant="destructive"
                                >
                                    <Icon icon="solar:trash-bin-trash-linear" className="w-4 h-4 mr-2" />
                                    Delete Selected ({selectedIds.length})
                                </Button>
                            </>
                        )}
                    </>
                }
                pagination={{
                    currentPage: page,
                    totalPages: data?.data?.totalPages || 0,
                    totalItems: data?.data?.total || 0,
                    itemsPerPage: limit,
                    onPageChange: (newPage) => setPage(newPage),
                }}
            />

            <AlertDialog open={!!destroyId} onOpenChange={() => setDestroyId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently Delete?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the technology from the
                            database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDestroy} className="bg-red-500 hover:bg-red-600">
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showBulkDestroyDialog} onOpenChange={setShowBulkDestroyDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently Delete Selected?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {selectedIds.length} {selectedIds.length === 1 ? 'technology' : 'technologies'} from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDestroy} className="bg-red-500 hover:bg-red-600">
                            Delete Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showRecoverAllDialog} onOpenChange={setShowRecoverAllDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Recover All Technologies?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will recover all {data?.data?.total || 0} deleted {data?.data?.total === 1 ? 'technology' : 'technologies'} and restore them to the active list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRecoverAll} className="bg-green-600 hover:bg-green-700">
                            Recover All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
