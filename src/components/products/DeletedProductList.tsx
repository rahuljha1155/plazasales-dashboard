import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Icon } from "@iconify/react/dist/iconify.js";
import { TableShimmer } from "@/components/table-shimmer";
import { DataTable } from "../ui/data-table";
import {
  useGetDeletedProducts,
  useRecoverProducts,
  useDestroyProductsPermanently
} from "@/services/product";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { createDeletedProductColumns } from "./DeletedProductTableColumns";
import type { IDeletedProduct } from "@/types/IProduct";
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

export default function DeletedProductList() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
  });

  const [selectedRows, setSelectedRows] = useState<IDeletedProduct[]>([]);

  const { data, isLoading } = useGetDeletedProducts(pagination.page, pagination.limit);
  const { mutateAsync: recoverProducts, isPending: isRecoverPending } = useRecoverProducts();
  const { mutateAsync: destroyPermanently, isPending: isDestroyPending } = useDestroyProductsPermanently();

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
      await recoverProducts([id]);
      queryClient.invalidateQueries({ queryKey: ["getDeletedProducts"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleDestroyPermanently = async (id: string) => {
    try {
      await destroyPermanently(id);
      queryClient.invalidateQueries({ queryKey: ["getDeletedProducts"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleRecoverSelected = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one product to recover");
      return;
    }

    try {
      const ids = selectedRows.map((product) => product.id);
      await recoverProducts(ids);
      queryClient.invalidateQueries({ queryKey: ["getDeletedProducts"] });
      setSelectedRows([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleRecoverAll = async () => {
    if (!data?.data?.products || data.data.products.length === 0) {
      toast.error("No deleted products to recover");
      return;
    }

    try {
      const ids = data.data.products.map((product: any) => product.id);
      await recoverProducts(ids);
      queryClient.invalidateQueries({ queryKey: ["getDeletedProducts"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const handleDestroySelectedPermanently = async () => {
    if (selectedRows.length === 0) {
      toast.error("Please select at least one product to delete permanently");
      return;
    }

    try {
      const ids = selectedRows.map((product) => product.id).join(",");
      await destroyPermanently(ids);
      queryClient.invalidateQueries({ queryKey: ["getDeletedProducts"] });
      setSelectedRows([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const columns = createDeletedProductColumns({
    onRecover: handleRecover,
    onDestroyPermanently: handleDestroyPermanently,
    isRecoverPending,
    isDestroyPending,
  });

  const tableData = (data?.data.products || []).map((product: any) => ({
    ...product,
    _id: product.id,
  }));

  const { selectedBrand, selectedCategory, selectedSubcategory } = useSelectedDataStore()

  const breadcrumbLinks = [{ label: selectedBrand?.slug || "Brands", href: "/dashboard/brands" },
  { label: selectedCategory?.slug || "Product Types", href: `/dashboard/category/${selectedBrand?.slug || ""}` },
  { label: selectedSubcategory?.slug || selectedSubcategory?.original?.slug || "Categories", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}` },
  { label: "Products", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}/products/${selectedSubcategory?.original?.slug || selectedSubcategory?.slug || selectedSubcategory?.original?.slug || ""}` },
  { label: "Deleted Products", isActive: true },
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Breadcrumb
          links={breadcrumbLinks}
        />
      </div>



      {/* Table Section */}
      <div className="bg-white">
        <DataTable
          columns={columns as any}
          data={tableData}
          elements={
            <div className="flex gap-2 flex-wrap">
              {selectedRows.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    className="rounded-sm hover:shadow-md transition-shadow text-green-600 hover:bg-green-50 hover:border-green-600"
                    onClick={handleRecoverSelected}
                    disabled={isRecoverPending}
                  >
                    <Icon icon="solar:refresh-bold" className="mr-2" width="20" />
                    Recover ({selectedRows.length})
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="rounded-sm hover:shadow-md transition-shadow text-red-600 hover:bg-red-50 hover:border-red-600"
                        disabled={isDestroyPending}
                      >
                        <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="20" />
                        Delete  ({selectedRows.length})
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
                              delete
                            </AlertDialogTitle>
                            <p className="text-sm text-gray-500 mt-1">
                              {selectedRows.length} product(s)
                            </p>
                          </div>
                        </div>
                        <AlertDialogDescription className="text-gray-600">
                          <span className="font-semibold text-red-600">Warning:</span> This action cannot be undone.
                          This will <span className="font-semibold">permanently delete</span> the selected products
                          and all associated data from the system forever.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-lg">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-500 hover:bg-red-600 rounded-lg"
                          onClick={handleDestroySelectedPermanently}
                        >
                          <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
                          Delete Forever
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
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
                            Recover All Products
                          </AlertDialogTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {data?.data.total} product(s)
                          </p>
                        </div>
                      </div>
                      <AlertDialogDescription className="text-gray-600">
                        This will restore all {data?.data.total} deleted products and make them available again in the system. Are you sure you want to proceed?
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
          filterColumn="name"
          filterPlaceholder="Search deleted products by name..."
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
