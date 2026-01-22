/**
 * @deprecated This component is deprecated. Use BrandListPage instead.
 * This file is kept for backward compatibility but should not be used in new code.
 * The brand management has been split into separate route components:
 * - BrandListPage: Main list view
 * - BrandCreatePage: Create new brand
 * - BrandEditPage: Edit existing brand
 * - BrandViewPage: View brand details
 */

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
import { BrandFormView } from "./BrandFormView";
import { BrandDetailView } from "./BrandDetailView";
import type { BrandListState, PaginationState } from "./types";
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

export default function BrandList() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
  });

  const { setSelectedBrand } = useSelectedDataStore()

  const { data, isLoading } = useGetBrands();
  const queryClient = useQueryClient();
  const { mutateAsync: updateSortOrder } = useUpdateBrandSortOrder();

  const [state, setState] = useState<BrandListState>({
    isAdding: false,
    brandToEdit: null,
    viewingBrand: null,
  });

  type Brand = NonNullable<typeof data>['data']['brands'][number];
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const { mutateAsync: deleteCategory, isPending: isDeletePending } =
    useDeleteCategory();
  const { mutateAsync: deleteBulkBrands, isPending: isBulkDeleting } = useDeleteBulkBrands();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update local brands state when data changes
  useEffect(() => {
    if (data?.data.brands) {
      const sortedBrands = [...data.data.brands].sort((a, b) => a.sortOrder - b.sortOrder);
      setBrands(sortedBrands);
    }
  }, [data]);

  const handleDelete = async (id: string) => {
    try {
      await deleteBrand(id);
      // Invalidate and refetch brands list
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
    setState((prev) => ({ ...prev, brandToEdit: brand.id }));
  };

  const handleView = (brand: any) => {
    setState((prev) => ({ ...prev, viewingBrand: brand.id }));
  };

  const handleFormSuccess = () => {
    setState({ isAdding: false, brandToEdit: null, viewingBrand: null });
  };

  const handleFormCancel = () => {
    setState((prev) => ({ ...prev, isAdding: false, brandToEdit: null }));
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

    // Update sort order on the server
    try {
      await updateSortOrder({
        brandId: active.id as string,
        sortOrder: newIndex + 1,
      });
      toast.success("Brand order updated successfully");
    } catch (error: any) {
      // Revert on error
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

  const getBreadcrumbLinks = () => {
    const baseLinks = [
      {
        label: "Brands",
        isActive: !state.isAdding && !state.brandToEdit && !state.viewingBrand,
        handleClick: () => setState({ isAdding: false, brandToEdit: null, viewingBrand: null })
      },
    ];

    if (state.isAdding) {
      baseLinks.push({
        label: "Add New",
        isActive: true,
        handleClick: () => { }
      });
    }

    if (state.brandToEdit) {
      baseLinks.push({
        label: "Edit Brand",
        isActive: true,
        handleClick: () => { }
      });
    }

    if (state.viewingBrand) {
      baseLinks.push({
        label: "View Details",
        isActive: true,
        handleClick: () => { }
      });
    }

    return baseLinks;
  };

  if (isLoading) {
    return (
      <div className="">
        <TableShimmer />
      </div>
    );
  }

  if (state.isAdding) {
    return (
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center pb-4">
          <Breadcrumb links={getBreadcrumbLinks()} />
        </div>
        <BrandFormView
          mode="create"
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  if (state.brandToEdit) {
    return (
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center pb-4">
          <Breadcrumb links={getBreadcrumbLinks()} />
        </div>
        <BrandFormView
          mode="edit"
          brandId={state.brandToEdit}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    );
  }

  if (state.viewingBrand) {
    return (
      <div className="w-full space-y-6">

        <BrandDetailView
          brandId={state.viewingBrand}
          onBack={() => setState((prev) => ({ ...prev, viewingBrand: null }))}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <Breadcrumb links={getBreadcrumbLinks()} />
      </div>

      <div className="bg-white   ">
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
                navigate(`/dashboard/category/${row.slug}`)
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
                    onClick={() =>
                      setState((prev) => ({ ...prev, isAdding: true }))
                    }
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
