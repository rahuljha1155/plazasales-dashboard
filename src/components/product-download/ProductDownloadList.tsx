import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetDownloadsByProductId,
  useDeleteProductDownload,
  useDownloadFile,
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

export default function ProductDownloadList() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const categoryId = params?.categoryId as string;
  const productId = params?.pid as string;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editDownload, setEditDownload] = useState<ProductDownload | null>(null);
  const [viewDownload, setViewDownload] = useState<ProductDownload | null>(null);
  const [selectedRows, setSelectedRows] = useState<ProductDownload[]>([]);

  const { selectedBrand, selectedCategory, selectedSubcategory, selectedProduct } = useSelectedDataStore();

  const { data, isLoading, error } = useGetDownloadsByProductId(productId);
  const { mutateAsync: deleteDownload, isPending: isDeletePending } = useDeleteProductDownload();
  const downloadFileMutation = useDownloadFile();

  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

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
    isDeletePending: isDeletePending,
  });

  const tableData = (data?.downloads || []).map((download: any) => ({
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
        <DataTable
          columns={columns as any}
          data={tableData}
          filterColumn="title"
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

