import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSearchProducts } from "@/hooks/useProduct";
import { DataTable } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createProductsColumns } from "./productsListColumns";

import { useDeleteProduct } from "@/hooks/useProduct";
import { useSelectedDataStore } from "@/store/selectedStore";
import { UserRole } from "../LoginPage";
import { useUserStore } from "@/store/userStore";
import { Icon } from "@iconify/react/dist/iconify.js";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { ExportConfigDialog } from "../ExportConfigDialog";


export default function ProductSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { user } = useUserStore();
  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;
  const { setSelectedProduct } = useSelectedDataStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf">("excel");
  const { data: response, isLoading, refetch } = useSearchProducts(searchQuery, { page, limit });
  const products = response?.data?.products || [];
  const total = response?.data?.total || 0;
  const totalPages = response?.data?.totalPages || 1;
  const currentPage = response?.data?.page || 1;
  // Delete logic (single and bulk)
  const { mutateAsync: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId);
      toast.success("Product deleted successfully");
      setDeleteId(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to delete product");
    }
  };

  const handleBulkDelete = async () => {
    // Implement bulk delete if needed, similar to productsList
    setShowBulkDeleteDialog(false);
    setSelectedRows([]);
    // Optionally refetch
    refetch();
  };

  const handleExportPDF = () => {
    setExportFormat("pdf");
    setExportDialogOpen(true);
  };
  const handleExportExcel = () => {
    setExportFormat("excel");
    setExportDialogOpen(true);
  };


  if (!searchQuery) {
    return (
      <div className="w-full flex flex-col">
        {/* Breadcrumb */}
        <div className="mb-4">
          {/* You can use your breadcrumb component here if needed */}
        </div>
        <Card className="mt-6">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground">
                Enter a search query to find products
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
  
      <Card className="p-0">
        <CardContent className="p-2">
          {isLoading ? (
            <div className="space-y-1">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 animate-pulse rounded"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">No products found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search query: "{searchQuery}"
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <DataTable
                  columns={createProductsColumns({ navigate, params: {}, setDeleteId, isSudoAdmin })}
                  data={products}
                  onRowClick={(row) => {
                    setSelectedProduct(row);
                    // Navigate to the proper product view route with all required params
                    const brandSlug = row.brand?.slug || row.brandId?.slug || '';
                    const categorySlug = row.category?.slug || row.categoryId?.slug || '';
                    const subcategorySlug = row.subcategory?.slug || row.subcategoryId?.slug || '';
                    
                    if (brandSlug && categorySlug && subcategorySlug) {
                      navigate(`/dashboard/category/${brandSlug}/subcategory/${categorySlug}/products/${subcategorySlug}/view/${row.id}`);
                    } else {
                      toast.error("Unable to navigate: Missing product hierarchy information");
                    }
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
                      <Button
                        onClick={handleExportPDF}
                        variant="outline"
                        className="flex rounded-xs items-center gap-2 cursor-pointer"
                      >
                        <Icon icon={"material-icon-theme:pdf"} className="h-4 w-4 text-red-600" />
                        Export PDF
                      </Button>
                      <Button
                        onClick={handleExportExcel}
                        variant="outline"
                        className="flex items-center rounded-xs gap-2 cursor-pointer"
                      >
                        <Icon icon={"vscode-icons:file-type-excel"} className="h-4 w-4 text-green-600" />
                        Export Excel
                      </Button>
                      {isSudoAdmin && (
                        <Button
                          variant="destructive"
                          onClick={() => navigate("/dashboard/deleted-products")}
                        >
                          <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4 mr-2" />
                          View Deleted
                        </Button>
                      )}
                      <Button
                        className="rounded-sm hover:shadow-md transition-shadow"
                        onClick={() => navigate("/dashboard/products/create")}
                      >
                        <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
                        New Product
                      </Button>
                    </div>
                  }
                  pagination={{
                    currentPage: currentPage,
                    totalPages: totalPages,
                totalItems: total,
                itemsPerPage: limit,
                onPageChange: (newPage: number) => setPage(newPage),
              }}
            />
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from the database.
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

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Items?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRows.length} selected item(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ExportConfigDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        resource="product"
        exportFormat={exportFormat}
        title="Export Products"
      />
    </div>
  );
}
