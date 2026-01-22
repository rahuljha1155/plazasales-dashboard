import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TableShimmer } from "@/components/table-shimmer";
import { DataTable } from "../ui/data-table";
import {
  useGetDeletedDownloadCategories,
  useRecoverDownloadCategories,
  useDestroyDownloadCategoryPermanently
} from "@/hooks/useDownloadCategory";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { createDeletedDownloadCategoryColumns } from "./DeletedDownloadCategoryTableColumns";
import type { Category } from "@/hooks/useDownloadCategory";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
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
import { useSelectedDataStore } from "@/store/selectedStore";

interface PaginationState {
  page: number;
  limit: number;
}

export default function DeletedDownloadCategoryList() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
  });
  const { selectedBrand, selectedCategory, selectedSubcategory, selectedProduct } = useSelectedDataStore()

  const [selectedRows, setSelectedRows] = useState<Category[]>([]);

  const { data, isLoading } = useGetDeletedDownloadCategories(pagination.page, pagination.limit);
  const { mutateAsync: recoverCategories, isPending: isRecoverPending } = useRecoverDownloadCategories();
  const { mutateAsync: destroyPermanently, isPending: isDestroyPending } = useDestroyDownloadCategoryPermanently();

  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

  if (!isSudoAdmin && !isLoading) {
    navigate("/dashboard");
    toast.error("Access denied. Only sudo admins can access this page.");
    return null;
  }

  const handleRecover = async (id: string) => {
    try {
      await recoverCategories([id]);
      toast.success("Download category recovered successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleRecoverAll = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one download category to recover");
      return;
    }

    try {
      const ids = selectedRows.map((category) => category.id);
      await recoverCategories(ids);
      toast.success(`${ids.length} download categories recovered successfully`);
      setSelectedRows([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleRecoverAllCategories = async () => {
    if (!data?.data?.categories || data.data.categories.length === 0) {
      toast.error("No deleted download categories to recover");
      return;
    }

    try {
      const ids = data.data.categories.map((category: Category) => category.id);
      await recoverCategories(ids);
      toast.success(`All ${ids.length} download categories recovered successfully`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleDestroyPermanently = async (id: string) => {
    try {
      await destroyPermanently(id);
      toast.success("Download category permanently deleted");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleDestroySelected = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one download category to delete permanently");
      return;
    }
    try {
      const ids = selectedRows.map((row) => row.id).join(",");
      await destroyPermanently(ids);
      toast.success(`${selectedRows.length} download categories permanently deleted`);
      setSelectedRows([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const columns = createDeletedDownloadCategoryColumns({
    onRecover: handleRecover,
    onDestroyPermanently: handleDestroyPermanently,
    isRecoverPending,
    isDestroyPending,
  });

  const tableData = (data?.data?.categories || []).map((category: Category) => ({
    ...category,
    _id: category.id,
  }));


  const breadcrumbLinks = [
    { label: selectedBrand?.name || "Brands", href: "/dashboard/brands" },
    { label: selectedCategory?.title || "Product Types", href: `/dashboard/category/${selectedBrand?.slug || ""}` },
    { label: selectedSubcategory?.title || "Categories", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}` },
    { label: selectedProduct?.name || "Products", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}/products/${selectedSubcategory?.slug || selectedSubcategory?.original?.slug || ""}` },
    { label: "Download Categories", href: `/dashboard/products/downloads/${selectedProduct?.id || selectedProduct?.original?.id || ""}` },
    { label: "Deleted Download Categories", isActive: true },
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Breadcrumb
          links={breadcrumbLinks}
        />
      </div>



      <div className="bg-white">
        <DataTable
          columns={columns as any}
          data={tableData}
          filterColumn="title"
          filterPlaceholder="Search deleted download categories by title..."
          elements={
            <div className="flex gap-2">
              {selectedRows.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="rounded-sm hover:shadow-md transition-shadow text-green-600 hover:bg-green-50 hover:border-green-600"
                    onClick={handleRecoverAll}
                    disabled={isRecoverPending}
                  >
                    <Icon icon="solar:refresh-bold" className="mr-2" width="20" />
                    Recover Selected ({selectedRows.length})
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="rounded-sm hover:shadow-md transition-shadow"
                        disabled={isDestroyPending}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="20" />
                        Delete Selected ({selectedRows.length})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="max-w-md">
                      <AlertDialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                            <Icon
                              icon="solar:trash-bin-trash-bold"
                              className="text-red-600"
                              width="24"
                            />
                          </div>
                          <div>
                            <AlertDialogTitle className="text-lg">
                              Delete Selected Categories
                            </AlertDialogTitle>
                            <p className="text-sm text-gray-500 mt-1">
                              {selectedRows.length} category(s) selected
                            </p>
                          </div>
                        </div>
                        <AlertDialogDescription className="text-gray-600">
                          This action cannot be undone. This will permanently delete the selected categories from the database.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-lg">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600 rounded-lg"
                          onClick={handleDestroySelected}
                        >
                          <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
                          Delete Forever
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}

              {tableData.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      className="rounded-sm bg-green-600 hover:bg-green-700 hover:shadow-md transition-shadow"
                      disabled={isRecoverPending}
                    >
                      <Icon icon="solar:refresh-bold" className="mr-2" width="20" />
                      Recover All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                          <Icon
                            icon="solar:refresh-bold"
                            className="text-green-600"
                            width="24"
                          />
                        </div>
                        <div>
                          <AlertDialogTitle className="text-lg">
                            Recover All Download Categories
                          </AlertDialogTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {data?.data.total} category(s)
                          </p>
                        </div>
                      </div>
                      <AlertDialogDescription className="text-gray-600">
                        This will restore all {data?.data.total} deleted download categories and make them available again in the system. Are you sure you want to proceed?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-lg">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-green-500 hover:bg-green-600 rounded-lg"
                        onClick={handleRecoverAllCategories}
                      >
                        <Icon icon="solar:refresh-bold" className="mr-2" width="16" />
                        Recover All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          }
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
          onRowSelectionChange={(rows) => {
            setSelectedRows(rows as Category[]);
          }}
        />
      </div>

    </div>
  );
}
