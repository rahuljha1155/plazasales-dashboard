import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TableShimmer } from "@/components/table-shimmer";
import { DataTable } from "../ui/data-table";
import {
  useGetDeletedSubcategories,
  useRecoverSubcategories,
  useDestroySubcategoryPermanently
} from "@/services/subcategory";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { createDeletedSubcategoryColumns } from "./DeletedSubcategoryTableColumns";
import type { IDeletedSubcategory } from "@/types/ISubcategory";
import { href, useNavigate } from "react-router-dom";
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
import { useQueryClient } from "@tanstack/react-query";
import { useSelectedDataStore } from "@/store/selectedStore";

interface PaginationState {
  page: number;
  limit: number;
}

export default function DeletedSubcategoryList() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
  });

  const [selectedRows, setSelectedRows] = useState<IDeletedSubcategory[]>([]);

  const { data, isLoading } = useGetDeletedSubcategories(pagination.page, pagination.limit);
  const { mutateAsync: recoverSubcategories, isPending: isRecoverPending } = useRecoverSubcategories();
  const { mutateAsync: destroyPermanently, isPending: isDestroyPending } = useDestroySubcategoryPermanently();

  // Check if user is sudo admin
  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

  // Redirect if not sudo admin
  if (!isSudoAdmin && !isLoading) {
    navigate("/dashboard");
    toast.error("Access denied. Only sudo admins can access this page.");
    return null;
  }

  const handleRecover = async (id: string) => {
    try {
      await recoverSubcategories([id]);
      queryClient.invalidateQueries({ queryKey: ["getDeletedSubcategories"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleDestroyPermanently = async (id: string) => {
    try {
      await destroyPermanently(id);
      queryClient.invalidateQueries({ queryKey: ["getDeletedSubcategories"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleDestroySelected = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one subcategory to delete");
      return;
    }

    try {
      const ids = selectedRows.map((sub) => sub.id).join(",");
      await destroyPermanently(ids);
      queryClient.invalidateQueries({ queryKey: ["getDeletedSubcategories"] });
      setSelectedRows([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleRecoverSelected = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one subcategory to recover");
      return;
    }

    try {
      const ids = selectedRows.map((subcategory) => subcategory.id);
      await recoverSubcategories(ids);
      queryClient.invalidateQueries({ queryKey: ["getDeletedSubcategories"] });
      setSelectedRows([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleRecoverAll = async () => {
    if (!data?.data?.subCategories || data.data.subCategories.length === 0) {
      toast.error("No deleted subcategories to recover");
      return;
    }

    try {
      const ids = data.data.subCategories.map((subcategory: any) => subcategory.id);
      await recoverSubcategories(ids);
      queryClient.invalidateQueries({ queryKey: ["getDeletedSubcategories"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const columns = createDeletedSubcategoryColumns({
    onRecover: handleRecover,
    onDestroyPermanently: handleDestroyPermanently,
    isRecoverPending,
    isDestroyPending,
  });

  const tableData = (data?.data.subCategories || []).map((subcategory: any) => ({
    ...subcategory,
    _id: subcategory.id,
  }));

  const { selectedBrand, selectedCategory } = useSelectedDataStore()


  const links = [
    { href: "/dashboard/brands", label: selectedBrand?.slug || "Brand" },
    {
      href: `/dashboard/category/${selectedBrand?.slug}`,
      label: selectedCategory?.slug || "Product Type",
    },
    {
      href: `/dashboard/category/${selectedBrand?.slug}/subcategory/${selectedCategory?.slug}`,
      label: "Product Category",
    },
    {
      label: "View Deleted",
      isActive: true,
    },
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

      <Breadcrumb links={links} />

      <div className="bg-white">
        <DataTable
          columns={columns as any}
          data={tableData}
          filterColumn="title"
          elements={
            <div className="flex gap-2">
              {selectedRows.length > 0 && (
                <Button
                  variant="outline"
                  className="rounded-sm hover:shadow-md transition-shadow text-green-600 hover:bg-green-50 hover:border-green-600"
                  onClick={handleRecoverSelected}
                  disabled={isRecoverPending}
                >
                  <Icon icon="solar:refresh-bold" className="mr-2" width="20" />
                  Recover ({selectedRows.length})
                </Button>
              )}

              {selectedRows.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-sm hover:shadow-md transition-shadow text-red-600 hover:bg-red-50 hover:border-red-600"
                      disabled={isDestroyPending}
                    >
                      <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="20" />
                      Delete ({selectedRows.length})
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
                            delete Subcategories
                          </AlertDialogTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {selectedRows.length} subcategory(ies)
                          </p>
                        </div>
                      </div>
                      <AlertDialogDescription className="text-gray-600">
                        This will permanently delete the selected subcategories. This action cannot be undone. Are you sure you want to proceed?
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
                        delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
                            Recover All
                          </AlertDialogTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {data?.data.total} subcategory(ies)
                          </p>
                        </div>
                      </div>
                      <AlertDialogDescription className="text-gray-600">
                        This will restore all {data?.data.total} deleted subcategories and make them available again in the system. Are you sure you want to proceed?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-lg">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-green-500 hover:bg-green-600 rounded-lg"
                        onClick={handleRecoverAll}
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
          filterPlaceholder="Search deleted subcategories by name..."
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
          onRowSelectionChange={setSelectedRows}
        />
      </div>

    </div>
  );
}
