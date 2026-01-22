import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api2 } from "@/services/api";
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
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import Breadcrumb from "../dashboard/Breadcumb";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import { DataTable } from "@/components/ui/data-table";
import { createSharableColumns } from "./SharableTableColumns";
import SharableCreateModal from "./SharableCreateModal";
import SharableEditModal from "./SharableEditModal";
import SharableViewPage from "./SharableViewPage";
import { SortableSharableRow } from "./SortableSharableRow";
import { useRecaptcha } from "@/hooks/useRecaptcha";
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

type EntityType = "product" | "brand" | "category" | "subcategory";

interface SharableListProps {
    entityType: EntityType;
    entityId: string;
    entityName?: string;
}

interface ISharable {
    id: string;
    productId?: string;
    kind: string;
    title: string;
    fileType: string;
    isActive: boolean;
    sortOrder: number;
    extra: string;
    mediaAsset: {
        id: string;
        fileUrl: string;
        type: string;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    };
    createdAt: string;
    updatedAt: string;
}

type ViewMode = "list" | "view" | "edit" | "create";

export default function SharableList({ entityType, entityId, entityName }: SharableListProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useUserStore();
    const { getRecaptchaToken } = useRecaptcha();

    const [deleteIds, setDeleteIds] = useState<string[]>([]);
    const [selectedRows, setSelectedRows] = useState<ISharable[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [selectedSharable, setSelectedSharable] = useState<ISharable | null>(null);
    const [sharables, setSharables] = useState<ISharable[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const { data, isLoading } = useQuery({
        queryKey: ["getSharables", entityId],
        queryFn: async () => {
            const url = entityId 
                ? `/shareable/get-all-shareables?productId=${entityId}`
                : `/shareable/get-all-shareables`;
            const res = await api2.get<{ 
                status: number; 
                message: string;
                data: {
                    shareables: ISharable[];
                    total: number;
                    page: number;
                    limit: number;
                    totalPages: number;
                }
            }>(url);
            return res.data.data;
        },
    });

    // Update local sharables state when data changes
    useEffect(() => {
        if (data?.shareables) {
            const sortedSharables = [...data.shareables].sort((a, b) => a.sortOrder - b.sortOrder);
            setSharables(sortedSharables);
        }
    }, [data]);

    const handleDelete = async () => {
        if (deleteIds.length === 0) return;

        try {
            // Soft delete for all users
            await api2.delete(`/shareable/delete-shareable/${deleteIds.join(",")}`);
            toast.success("Sharable deleted successfully");
            
            setDeleteIds([]);
            setSelectedRows([]);
            
            // If we're in view mode and deleted the current item, go back to list
            if (viewMode === "view" && selectedSharable && deleteIds.includes(selectedSharable.id)) {
                setViewMode("list");
                setSelectedSharable(null);
            }
            
            queryClient.invalidateQueries({ queryKey: ["getSharables", entityId] });
            queryClient.invalidateQueries({ queryKey: ["getDeletedSharables", entityId] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to delete sharable");
        }
    };

    const handleBulkDelete = () => {
        if (selectedRows.length > 0) {
            setDeleteIds(selectedRows.map(s => s.id));
        }
    };

    const handleView = (sharable: ISharable) => {
        setSelectedSharable(sharable);
        setViewMode("view");
    };

    const handleEdit = (sharable: ISharable) => {
        setSelectedSharable(sharable);
        setViewMode("edit");
    };

    const handleBackToList = () => {
        setViewMode("list");
        setSelectedSharable(null);
        // Refetch the data
        queryClient.invalidateQueries({ queryKey: ["getSharables", entityId] });
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = sharables.findIndex((sharable) => sharable.id === active.id);
        const newIndex = sharables.findIndex((sharable) => sharable.id === over.id);

        const newSharables = arrayMove(sharables, oldIndex, newIndex);
        
        // Update the sortOrder property for all items in the new array
        const updatedSharables = newSharables.map((sharable, index) => ({
            ...sharable,
            sortOrder: index + 1
        }));
        
        // Optimistically update the UI with new sort orders
        setSharables(updatedSharables);

        // Update sort order on the server with explicit reCAPTCHA token
        try {
            // Update all items with their new sort orders sequentially
            for (let i = 0; i < updatedSharables.length; i++) {
                const sharable = updatedSharables[i];
                const originalSharable = sharables.find(s => s.id === sharable.id);
                
                // Only update if sort order actually changed
                if (originalSharable && originalSharable.sortOrder !== sharable.sortOrder) {
                    // Get a fresh token for each request
                    const recaptchaToken = await getRecaptchaToken('update_sort_order');
                    
                    if (!recaptchaToken) {
                        toast.error("Failed to verify reCAPTCHA");
                        setSharables(sharables); // Revert on error
                        return;
                    }

                    await api2.put(
                        `/shareable/update-shareable/${sharable.id}`,
                        { sortOrder: sharable.sortOrder },
                        {
                            headers: {
                                'X-Recaptcha-Token': recaptchaToken
                            }
                        }
                    );
                }
            }
            
            toast.success("Sharable order updated successfully");
            
            // Refetch to get the updated data from server
            queryClient.invalidateQueries({ queryKey: ["getSharables", entityId] });
        } catch (error: any) {
            // Revert on error
            setSharables(sharables);
            toast.error(error?.response?.data?.message || "Failed to update sharable order");
        }
    };

    const breadcrumbLinks = [
        { label: "Sharables", href: "#" },
        { label: "View All", isActive: true },
    ];

    const columns = createSharableColumns({
        onEdit: handleEdit,
        onView: handleView,
        onDelete: (id) => setDeleteIds([id]),
    });

    const tableData = sharables || [];

    // Show view page
    if (viewMode === "view" && selectedSharable) {
        return <SharableViewPage sharable={selectedSharable} onBack={handleBackToList} />;
    }

    // Show edit page
    if (viewMode === "edit" && selectedSharable) {
        return (
            <SharableEditModal
                sharable={selectedSharable}
                onSuccess={handleBackToList}
                onCancel={handleBackToList}
            />
        );
    }

    // Show create page
    if (viewMode === "create") {
        return (
            <SharableCreateModal
                productId={entityId || undefined}
                onSuccess={handleBackToList}
                onCancel={handleBackToList}
            />
        );
    }

    return (
        <div className="space-y-6">
            <Breadcrumb links={breadcrumbLinks} />

            <div>
                {isLoading ? (
                    <div className="rounded-xs border">
                        <div className="p-4 flex justify-between items-center border-b">
                            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
                            <div className="flex gap-2">
                                <div className="h-9 w-32 bg-gray-200 animate-pulse rounded" />
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 border rounded">
                                        <div className="h-4 w-4 bg-gray-200 animate-pulse rounded" />
                                        <div className="h-4 w-8 bg-gray-200 animate-pulse rounded" />
                                        <div className="h-4 w-40 bg-gray-200 animate-pulse rounded" />
                                        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                                        <div className="h-4 w-28 bg-gray-200 animate-pulse rounded" />
                                        <div className="h-6 w-16 bg-gray-200 animate-pulse rounded" />
                                        <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                                        <div className="ml-auto h-8 w-8 bg-gray-200 animate-pulse rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={sharables.map((sharable) => sharable.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <DataTable
                                columns={columns}
                                data={tableData}
                                onRowSelectionChange={setSelectedRows}
                                filterColumn="title"
                                filterPlaceholder="Filter sharables..."
                                DraggableRow={SortableSharableRow}
                                pagination={{
                                    itemsPerPage: pagination.limit,
                                    currentPage: pagination.page,
                                    totalItems: tableData.length,
                                    totalPages: Math.ceil(tableData.length / pagination.limit),
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
                                    <div className="flex justify-end items-center gap-2">
                                        {selectedRows.length > 0 && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={handleBulkDelete}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete ({selectedRows.length})
                                            </Button>
                                        )}
                                        {user?.role === UserRole.SUDOADMIN && (
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    const path = entityId 
                                                        ? `/dashboard/products/${entityId}/sharable/deleted`
                                                        : `/dashboard/sharable/deleted`;
                                                    navigate(path);
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                View Deleted
                                            </Button>
                                        )}
                                        <Button onClick={() => setViewMode("create")}>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Sharable
                                        </Button>
                                    </div>
                                }
                            />
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            {/* Delete Alert Dialog */}
            <AlertDialog open={deleteIds.length > 0} onOpenChange={() => setDeleteIds([])}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will move {deleteIds.length} sharable(s) to trash.
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
        </div>
    );
}
