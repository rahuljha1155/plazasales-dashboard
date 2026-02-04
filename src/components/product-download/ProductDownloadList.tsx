import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetDownloadsByProductId,
  useDeleteProductDownload,
  useDownloadFile,
  useUpdateProductDownloadSortOrder,
} from "@/hooks/useProductDownload";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ProductDownloadCreateModal } from "./ProductDownloadCreateModal";
import { ProductDownloadEditModal } from "./ProductDownloadEditModal";
import { ProductDownloadViewModal } from "./ProductDownloadViewModal";
import type { ProductDownload } from "@/types/IDownload";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useSelectedDataStore } from "@/store/selectedStore";
import { DataTable } from "../ui/data-table";
import { createProductDownloadColumns } from "./ProductDownloadTableColumns";
import { TableShimmer } from "@/components/table-shimmer";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import Breadcrumb from "@/components/dashboard/Breadcumb";
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
import { SortableProductDownloadRow } from "./SortableProductDownloadRow";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

export default function ProductDownloadList() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const categoryId = params?.categoryId as string;
  const productId = params?.pid as string;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editDownload, setEditDownload] = useState<ProductDownload | null>(null);
  const [viewDownload, setViewDownload] = useState<ProductDownload | null>(null);
  const [selectedRows, setSelectedRows] = useState<ProductDownload[]>([]);
  const [downloads, setDownloads] = useState<ProductDownload[]>([]);

  const { selectedBrand, selectedCategory, selectedSubcategory, selectedProduct } = useSelectedDataStore();

  const { data, isLoading, error } = useGetDownloadsByProductId(productId);
  const { mutateAsync: deleteDownload, isPending: isDeletePending } = useDeleteProductDownload();
  const downloadFileMutation = useDownloadFile();
  const { mutateAsync: updateSortOrder } = useUpdateProductDownloadSortOrder();

  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (data?.downloads) {
      // Debug: Log the data to see what we're working with
      console.log('=== DOWNLOAD DEBUG INFO ===');
      console.log('All downloads:', data.downloads);
      console.log('Current categoryId from URL:', categoryId);
      console.log('Current productId from URL:', productId);
      console.log('Downloads details:', data.downloads.map(d => ({ 
        id: d.id, 
        title: d.title, 
        categoryId: d.categoryId,
        productId: d.productId 
      })));
      
      // Filter downloads:
      // - If download has a categoryId, only show if it matches the current category
      // - If download has no categoryId (undefined/null), show it in all categories (legacy support)
      let filteredDownloads = data.downloads;
      
      if (categoryId) {
        filteredDownloads = data.downloads.filter(
          (download) => {
            // Show download if:
            // 1. It has no categoryId (legacy downloads) OR
            // 2. Its categoryId matches the current category
            const hasNoCategoryId = !download.categoryId;
            const matchesCategory = download.categoryId === categoryId;
            const shouldShow = hasNoCategoryId || matchesCategory;
            
            console.log(`Download "${download.title}" - categoryId: ${download.categoryId}, hasNoCategoryId: ${hasNoCategoryId}, matches: ${matchesCategory}, shouldShow: ${shouldShow}`);
            return shouldShow;
          }
        );
        console.log('Filtered downloads count:', filteredDownloads.length);
        console.log('Filtered downloads:', filteredDownloads);
      }
      
      const sortedDownloads = [...filteredDownloads].sort((a, b) => a.sortOrder - b.sortOrder);
      setDownloads(sortedDownloads);
      console.log('=== END DEBUG INFO ===');
    } else {
      console.log('No downloads data available');
    }
  }, [data, categoryId, productId]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDownload(id);
      toast.success("Download deleted successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete download");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one download to delete");
      return;
    }

    try {
      const ids = selectedRows.map((d) => d.id).join(",");
      await deleteDownload(ids);
      toast.success(`${selectedRows.length} downloads deleted successfully`);
      setSelectedRows([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete downloads");
    }
  };

  const handleDownloadFile = async (downloadId: string) => {
    try {
      await downloadFileMutation.mutateAsync(downloadId);
      toast.success("Download started");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to download file");
    }
  };

  const handleToggleDeprecated = async (downloadId: string, deprecated: boolean) => {
    try {
      // Update the local state optimistically
      setDownloads(prevDownloads =>
        prevDownloads.map(d =>
          d.id === downloadId ? { ...d, deprecated } : d
        )
      );
      
      // Make the API call to update deprecated status
      await api.put(`/product-download/update-download/${downloadId}`, { deprecated });
      
      toast.success(`Download ${deprecated ? 'marked as deprecated' : 'unmarked as deprecated'}`);
      queryClient.invalidateQueries({ queryKey: ["product-downloads-by-product", productId] });
    } catch (error: any) {
      // Revert on error
      setDownloads(prevDownloads =>
        prevDownloads.map(d =>
          d.id === downloadId ? { ...d, deprecated: !deprecated } : d
        )
      );
      toast.error(error?.response?.data?.message || "Failed to update deprecated status");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = downloads.findIndex((download) => download.id === active.id);
    const newIndex = downloads.findIndex((download) => download.id === over.id);

    const newDownloads = arrayMove(downloads, oldIndex, newIndex);
    
    // Update the sortOrder property for all items in the new array
    const updatedDownloads = newDownloads.map((download, index) => ({
      ...download,
      sortOrder: index + 1
    }));
    
    // Optimistically update the UI with new sort orders
    setDownloads(updatedDownloads);

    try {
      // Update all items with their new sort orders sequentially
      for (let i = 0; i < updatedDownloads.length; i++) {
        const download = updatedDownloads[i];
        const originalDownload = downloads.find(d => d.id === download.id);
        
        // Only update if sort order actually changed
        if (originalDownload && originalDownload.sortOrder !== download.sortOrder) {
          await updateSortOrder({
            downloadId: download.id,
            sortOrder: download.sortOrder,
          });
        }
      }
      
      toast.success("Download order updated successfully");
      
      // Refetch to get the updated data from server
      queryClient.invalidateQueries({ queryKey: ["product-downloads-by-product", productId] });
    } catch (error: any) {
      // Revert on error
      setDownloads(downloads);
      toast.error(error?.response?.data?.message || "Failed to update download order");
    }
  };

  const breadcrumbLinks = [
    { label: selectedBrand?.name || "Brands", href: "/dashboard/brands" },
    { label: selectedCategory?.title || "Product Types", href: `/dashboard/category/${selectedBrand?.slug || ""}` },
    { label: selectedSubcategory?.title || "Categories", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}` },
    { label: selectedProduct?.name || "Products", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}/products/${selectedSubcategory?.slug || selectedSubcategory?.original?.slug || ""}` },
    { label: "Downloads", isActive: true },
  ];

  const columns = createProductDownloadColumns({
    onEdit: (download) => setEditDownload(download),
    onView: (download) => setViewDownload(download),
    onDelete: handleDelete,
    onDownloadFile: handleDownloadFile,
    onToggleDeprecated: handleToggleDeprecated,
    isDeletePending: isDeletePending,
  });

  const tableData = downloads.map((download: any) => ({
    ...download,
    _id: download.id,
  }));

  if (error) {
    return (
      <div className="p-6">
        <div className="p-6 border rounded-lg bg-red-50">
          <p className="text-red-500">
            Error loading downloads: {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center ">
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
            items={downloads.map((download) => download.id)}
            strategy={verticalListSortingStrategy}
          >
            <DataTable
              columns={columns as any}
              data={tableData}
              filterColumn="title"
              DraggableRow={SortableProductDownloadRow}
              onRowClick={(row) => setViewDownload(row as ProductDownload)}
              elements={
                <div className="flex gap-2">
                  {selectedRows.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={isDeletePending}
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
                                Delete Product Downloads
                              </AlertDialogTitle>
                              <p className="text-sm text-gray-500 mt-1">
                                {selectedRows.length} item(s)
                              </p>
                            </div>
                          </div>
                          <AlertDialogDescription className="text-gray-600">
                            This action will move the selected {selectedRows.length} downloads to the trash.
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
                            Delete Downloads
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  <Button
                    className="rounded-sm hover:shadow-md transition-shadow"
                    onClick={() => setCreateModalOpen(true)}
                  >
                    <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
                    New Download
                  </Button>

                  {isSudoAdmin && tableData.length >= 0 && (
                    <Button
                      variant="destructive"
                      onClick={() => navigate("/dashboard/product-downloads/deleted")}
                    >
                      <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                      View Deleted
                    </Button>
                  )}
                </div>
              }
              filterPlaceholder="Search product downloads by title..."
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
                setSelectedRows(rows as ProductDownload[]);
              }}
            />
          </SortableContext>
        </DndContext>
      </div>


      <ProductDownloadCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        categoryId={categoryId}
        productId={productId}
      />

      {editDownload && (
        <ProductDownloadEditModal
          open={!!editDownload}
          onOpenChange={(open: boolean) => !open && setEditDownload(null)}
          download={editDownload}
          categoryId={categoryId}
          productId={productId}
        />
      )}

      {viewDownload && (
        <ProductDownloadViewModal
          open={!!viewDownload}
          onOpenChange={(open: boolean) => !open && setViewDownload(null)}
          download={viewDownload}
        />
      )}
    </div>
  );
}

