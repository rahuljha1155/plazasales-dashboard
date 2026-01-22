import { useState, useEffect } from "react";
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
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableTechnologyRow } from "./SortableTechnologyRow";
import { api2 } from "@/services/api";
import { toast } from "sonner";

export default function TechnologyList() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [technologies, setTechnologies] = useState<ITechnology[]>([]);

    const { data, isLoading, refetch } = useGetTechnologies(page, limit);
    const { mutateAsync: deleteBulkTechnologies, isPending: isBulkDeleting } = useDeleteBulkTechnologies();
    const deleteMutation = useDeleteTechnology();

    const { user } = useUserStore();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (data?.data?.technologies) {
            const sortedTechnologies = [...data.data.technologies].sort((a, b) => a.sortOrder - b.sortOrder);
            setTechnologies(sortedTechnologies);
        }
    }, [data]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = technologies.findIndex((tech) => tech.id === active.id);
        const newIndex = technologies.findIndex((tech) => tech.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const reordered = arrayMove(technologies, oldIndex, newIndex);
        
        const updatedTechnologies = reordered.map((technology, index) => ({
            ...technology,
            sortOrder: index + 1
        }));
        
        setTechnologies(updatedTechnologies);

        try {
            for (let i = 0; i < updatedTechnologies.length; i++) {
                const technology = updatedTechnologies[i];
                const originalTechnology = technologies.find(t => t.id === technology.id);
                
                if (originalTechnology && originalTechnology.sortOrder !== technology.sortOrder) {
                    await api2.put(`/technology/update-technology/${technology.id}`, {
                        sortOrder: technology.sortOrder,
                    });
                }
            }
            
            toast.success("Technology order updated successfully");
            refetch();
        } catch (e: any) {
            setTechnologies(technologies);
            toast.error(e?.response?.data?.message || "Failed to update order", {
                description: e?.response?.data?.message || "Something went wrong"
            });
        }
    };

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
            id: "drag",
            header: () => <div className="w-2"></div>,
            cell: () => <div></div>,
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
                    className="h-12 w-12 object-cover rounded"
                />
            ),
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => <div className="max-w-[15rem] truncate">
                {row?.original?.title}
            </div>
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => (
                <div 
                    className="max-w-[20rem] line-clamp-2 text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: row?.original?.description || 'N/A' }}
                />
            ),
        },

        {
            accessorKey: "createdAt",
            header: "Created At",
            cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
        },
        {
            id: "actions",
            header: () => <div className="text-center font-semibold text-gray-700">Actions</div>,
            cell: ({ row }) => (
                <div className="flex gap-1 justify-center items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/dashboard/technology/view/${row.original.id}`)}
                        className="h-8 w-8 hover:bg-blue-50"
                        title="View Details"
                    >
                        <Icon icon="mdi:eye" className="h-4 w-4 text-zinc-300 hover:text-zinc-800" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/dashboard/technology/edit/${row.original.id}`)}
                        className="h-8 w-8 hover:bg-green-50"
                        title="Edit Technology"
                    >
                        <Icon icon="mdi:pencil" className="h-4 w-4 text-zinc-300 hover:text-zinc-800" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(row.original.id)}
                        className="h-8 w-8 hover:bg-red-50"
                        title="Delete Technology"
                    >
                        <Icon icon="mdi:delete" className="h-4 w-4 text-zinc-300 hover:text-red-500" />
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

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={technologies.map((tech) => tech.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <DataTable
                        columns={columns}
                        data={technologies}
                        DraggableRow={SortableTechnologyRow}
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
                </SortableContext>
            </DndContext>

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
