import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TableShimmer } from "@/components/table-shimmer";
import { useDeleteCategory } from "@/hooks/useCategory";
import { DataTable } from "../ui/data-table";
import { deleteBrand, useGetBrands, useUpdateBrandSortOrder, useDeleteBulkBrands } from "@/services/brand";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { createBrandColumns } from "./BrandTableColumns";
import { SortableBrandRow } from "./SortableBrandRow";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
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
import { useSelectedDataStore } from "@/store/selectedStore";
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

interface PaginationState {
    page: number;
    limit: number;
}

export default function BrandListPage() {
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        limit: 10,
    });

    const { setSelectedBrand } = useSelectedDataStore();

    const { data, isLoading } = useGetBrands();
    const queryClient = useQueryClient();
    const { mutateAsync: updateSortOrder } = useUpdateBrandSortOrder();

    type Brand = NonNullable<typeof data>['data']['brands'][number];
    const [brands, setBrands] = useState<Brand[]>([]);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

    const { isPending: isDeletePending } = useDeleteCategory();
    const { mutateAsync: deleteBulkBrands, isPending: isBulkDeleting } = useDeleteBulkBrands();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (data?.data.brands) {
            const sortedBrands = [...data.data.brands].sort((a, b) => a.sortOrder - b.sortOrder);
            setBrands(sortedBrands);
        }
    }, [data]);

    const handleDelete = async (id: string) => {
        try {
            await deleteBrand(id);
            queryClient.invalidateQueries({ queryKey: ["getBrands"] });
            toast.success("Brand deleted successfully");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleBulkDelete = async () => {
        try {
            const ids = selectedRows.map(row => row.id);
            await deleteBulkBrands(ids);
            setShowBulkDeleteDialog(false);
            setSelectedRows([]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message);
        }
    };

    const handleEdit = (brand: any) => {
        navigate(`/dashboard/brands/edit/${brand.slug}`);
    };

    const handleView = (brand: any) => {
        navigate(`/dashboard/brands/view/${brand.slug}`);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = brands.findIndex((brand) => brand.id === active.id);
        const newIndex = brands.findIndex((brand) => brand.id === over.id);

        const newBrands = arrayMove(brands, oldIndex, newIndex);
        setBrands(newBrands);

        try {
            await updateSortOrder({
                brandId: active.id as string,
                sortOrder: newIndex + 1,
            });
            toast.success("Brand order updated successfully");
        } catch (error: any) {
            setBrands(brands);
            toast.error(error?.response?.data?.message || "Failed to update brand order");
        }
    };

    const columns = createBrandColumns({
        onEdit: handleEdit,
        onView: handleView,
        onDelete: handleDelete,
        isDeletePending,
    });

    const tableData = brands.map((brand) => ({
        ...brand,
        _id: brand.id,
    }));

    const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

    const breadcrumbLinks = [
        {
            label: "Brands",
            isActive: true,
            handleClick: () => { }
        },
    ];

    if (isLoading) {
        return (
            <div className="">
                <TableShimmer />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
                <Breadcrumb links={breadcrumbLinks} />
            </div>

            <div className="bg-white">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={brands.map((brand) => brand.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <DataTable
                            columns={columns as any}
                            data={tableData}
                            filterColumn="name"
                            filterPlaceholder="Search brands by name..."
                            DraggableRow={SortableBrandRow}
                            onRowClick={(row) => {
                                setSelectedBrand(row);
                                navigate(`/dashboard/category/${row.slug}`);
                            }}
                            pagination={{
                                itemsPerPage: pagination.limit,
                                currentPage: data?.data?.page || 1,
                                totalItems: brands.length || 0,
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
                                    {isSudoAdmin && (
                                        <Button
                                            variant="destructive"
                                            onClick={() => navigate("/dashboard/deleted-brands")}
                                        >
                                            <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                                            View Deleted
                                        </Button>
                                    )}
                                    <Button
                                        className="rounded-sm hover:shadow-md transition-shadow"
                                        onClick={() => navigate("/dashboard/brands/create")}
                                    >
                                        <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
                                        New Brand
                                    </Button>
                                </div>
                            }
                        />
                    </SortableContext>
                </DndContext>
            </div>

            <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>delete Brands?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedRows.length} selected brand(s)? This action cannot be undone.
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
