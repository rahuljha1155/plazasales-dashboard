import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetCategoriesByProduct, useDeleteDownloadCategory, useDeleteBulkDownloadCategories, useUpdateDownloadCategorySortOrder } from "@/hooks/useDownloadCategory";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DownloadCategoryCreateModal } from "./DownloadCategoryCreateModal";
import { DownloadCategoryEditModal } from "./DownloadCategoryEditModal";
import { DownloadCategoryViewModal } from "./DownloadCategoryViewModal";
import type { Category } from "@/hooks/useDownloadCategory";
import { Icon } from "@iconify/react/dist/iconify.js";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { useSelectedDataStore } from "@/store/selectedStore";
import { DataTable } from "../ui/data-table";
import { createDownloadCategoryColumns } from "./DownloadCategoryTableColumns";
import { TableShimmer } from "@/components/table-shimmer";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger, } from "@/components/ui/alert-dialog";
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
import { SortableDownloadCategoryRow } from "./SortableDownloadCategoryRow";
import { useQueryClient } from "@tanstack/react-query";

interface DownloadCategoryListProps {
  productId?: string;
}

export default function DownloadCategoryList({ productId }: DownloadCategoryListProps) {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const product_id = params?.id || productId || "";
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [viewCategory, setViewCategory] = useState<Category | null>(null);
  const [selectedRows, setSelectedRows] = useState<Category[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const { selectedBrand, selectedCategory, selectedSubcategory, selectedProduct, setSelectedProductCategory } = useSelectedDataStore();
  const { data, isLoading, error } = useGetCategoriesByProduct(product_id);
  const { mutateAsync: deleteCategory, isPending: isDeletePending } = useDeleteDownloadCategory();
  const { mutateAsync: deleteBulkCategories, isPending: isBulkDeletePending } = useDeleteBulkDownloadCategories();
  const { mutateAsync: updateSortOrder } = useUpdateDownloadCategorySortOrder();
  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (data?.categories) {
      const sortedCategories = [...data.categories].sort((a, b) => a.sortOrder - b.sortOrder);
      setCategories(sortedCategories);
    }
  }, [data]);

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      toast.success("Download category deleted successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete download category");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one download category to delete");
      return;
    }

    try {
      const ids = selectedRows.map((category) => category.id);
      await deleteBulkCategories(ids);
      toast.success(`${ids.length} download categories deleted successfully`);
      setSelectedRows([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete download categories");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = categories.findIndex((category) => category.id === active.id);
    const newIndex = categories.findIndex((category) => category.id === over.id);

    const newCategories = arrayMove(categories, oldIndex, newIndex);
    
    // Update the sortOrder property for all items in the new array
    const updatedCategories = newCategories.map((category, index) => ({
      ...category,
      sortOrder: index + 1
    }));
    
    // Optimistically update the UI with new sort orders
    setCategories(updatedCategories);

    try {
      // Update all items with their new sort orders sequentially
      for (let i = 0; i < updatedCategories.length; i++) {
        const category = updatedCategories[i];
        const originalCategory = categories.find(c => c.id === category.id);
        
        // Only update if sort order actually changed
        if (originalCategory && originalCategory.sortOrder !== category.sortOrder) {
          await updateSortOrder({
            categoryId: category.id,
            sortOrder: category.sortOrder,
          });
        }
      }
      
      toast.success("Category order updated successfully");
      
      // Refetch to get the updated data from server
      queryClient.invalidateQueries({ queryKey: ["download-categories-by-product", product_id] });
    } catch (error: any) {
      // Revert on error
      setCategories(categories);
      toast.error(error?.response?.data?.message || "Failed to update category order");
    }
  };

  const breadcrumbLinks = [
    { label: selectedBrand?.name || "Brands", href: "/dashboard/brands" },
    { label: selectedCategory?.title || "Product Types", href: `/dashboard/category/${selectedBrand?.slug || ""}` },
    { label: selectedSubcategory?.title || "Categories", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}` },
    { label: selectedProduct?.name || "Products", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}/products/${selectedSubcategory?.slug || selectedSubcategory?.original?.slug || ""}` },
    { label: "Download Categories", isActive: true },
  ];

  const columns = createDownloadCategoryColumns({
    onEdit: (category) => setEditCategory(category),
    onView: (category) => setViewCategory(category),
    onDelete: handleDelete,
    isDeletePending: isDeletePending || isBulkDeletePending,
    productId: product_id,
  });

  const tableData = categories.map((category: any) => ({
    ...category,
    _id: category.id,
  }));

  if (error) {
    return (
      <div className="p-6">
        <div className="p-6 border rounded-lg bg-red-50">
          <p className="text-red-500">
            Error loading categories: {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <TableShimmer />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Breadcrumb links={breadcrumbLinks} />
      <div className="">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map((category) => category.id)}
            strategy={verticalListSortingStrategy}
          >
            <DataTable
              columns={columns as any}
              data={tableData}
              filterColumn="title"
              DraggableRow={SortableDownloadCategoryRow}
              onRowClick={(row) => {
                navigate(`/dashboard/download-category/${row.id}/contents/${product_id}`)
              }}
              elements={
                <div className="flex gap-2">
                  {selectedRows.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={isBulkDeletePending}
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
                                icon="solar:danger-bold"
                                className="text-red-600"
                                width="24"
                              />
                            </div>
                            <div>
                              <AlertDialogTitle className="text-lg">
                                Delete Download Categories
                              </AlertDialogTitle>
                              <p className="text-sm text-gray-500 mt-1">
                                {selectedRows.length} category(s)
                              </p>
                            </div>
                          </div>
                          <AlertDialogDescription className="text-gray-600">
                            This action cannot be undone. This will delete {selectedRows.length} download categories and all their associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-lg">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600 rounded-lg"
                            onClick={handleBulkDelete}
                          >
                            <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
                            Delete Categories
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {isSudoAdmin && tableData.length > 0 && (
                    <Button
                      variant="destructive"
                      onClick={() => navigate("/dashboard/download-categories/deleted")}
                    >
                      <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                      View Deleted
                    </Button>
                  )}

                  <Button
                    className="rounded-sm hover:shadow-md transition-shadow"
                    onClick={() => setCreateModalOpen(true)}
                  >
                    <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
                    New Category
                  </Button>

                </div>
              }
              filterPlaceholder="Search download categories by title..."
              pagination={{
                itemsPerPage: 10,
                currentPage: 1,
                totalItems: tableData.length,
                totalPages: 1,
                onPageChange: () => { },
                onItemsPerPageChange: () => { },
                showItemsPerPage: false,
                showPageInput: false,
                showPageInfo: true,
              }}
              onRowSelectionChange={(rows) => {
                setSelectedRows(rows as Category[]);
              }}
            />
          </SortableContext>
        </DndContext>
      </div>

      {/* Empty State */}
      {!isLoading && tableData.length === 0 && (
        <div className="text-center py-12 bg-white border rounded-lg">
          <Icon
            icon="solar:folder-open-bold"
            className="mx-auto text-gray-400 mb-4"
            width="64"
          />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Download Categories
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by creating your first download category.
          </p>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
            Create Category
          </Button>
        </div>
      )}

      {/* Create Modal */}
      <DownloadCategoryCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        productId={product_id}
      />

      {/* Edit Modal */}
      {editCategory && (
        <DownloadCategoryEditModal
          open={!!editCategory}
          onOpenChange={(open: boolean) => !open && setEditCategory(null)}
          category={{ ...editCategory, productId: params?.id || "" }}
        />
      )}

      {/* View Modal */}
      {viewCategory && (
        <DownloadCategoryViewModal
          open={!!viewCategory}
          onOpenChange={(open: boolean) => !open && setViewCategory(null)}
          category={{ ...viewCategory, productId: params?.id || "" }}
        />
      )}
    </div>
  );
}
