import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  useDeleteProduct,
  useDeleteBulkProducts,
} from "@/hooks/useProduct";
import { useSelectionStore } from "@/store/selectionStore";
import { useGetProductsBySubcategory, useUpdateProductSortOrder } from "@/services/product";
import { useQueryClient } from "@tanstack/react-query";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow, TableCell } from "@/components/ui/table";
import { DataTable } from "@/components/ui/data-table";
import { createProductsColumns } from "./productsListColumns";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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


import {
  GripVertical
} from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from "sonner";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import Breadcrumb from "../dashboard/Breadcumb";
import { useSelectedDataStore } from "@/store/selectedStore";
import { ExportConfigDialog } from "../ExportConfigDialog";


export default function ProductsList() {
  const navigate = useNavigate();
  const { setSelectedProduct } = useSelectedDataStore()
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedBrandId, selectedCategoryId, selectedSubcategoryId } = useSelectionStore();

  // Try to get IDs from params first, then fall back to store
  const subcategoryId = params.pid || selectedSubcategoryId || "";
  const categoryId = params.id || selectedCategoryId || "";

  // Get page from URL or default to 1
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const [page, setPage] = useState(pageFromUrl);
  const [limit] = useState(10);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { user } = useUserStore();
  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;
  const [products, setProducts] = useState<any[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const { mutateAsync: deleteBulkProducts, isPending: isBulkDeleting } = useDeleteBulkProducts();

  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf">("excel");

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateSortOrderMutation = useUpdateProductSortOrder();
  const queryClient = useQueryClient();

  // Sortable row component
  const DraggableRow = ({ id, children }: { id: string; company: any; children: React.ReactNode }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <TableRow
        ref={setNodeRef}
        style={style as React.CSSProperties}
        className="hover:bg-zinc-50"
      >
        <TableCell
          className="w-10 p-2 px-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
        </TableCell>
        {children}
      </TableRow>
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(products, oldIndex, newIndex);
    
    // Update the sortOrder property for all items in the new array
    const updatedProducts = reordered.map((product, index) => ({
      ...product,
      sortOrder: index + 1
    }));
    
    // Optimistically update the UI with new sort orders
    setProducts(updatedProducts);

    try {
      // Update all items with their new sort orders sequentially
      for (let i = 0; i < updatedProducts.length; i++) {
        const product = updatedProducts[i];
        const originalProduct = products.find(p => p.id === product.id);
        
        // Only update if sort order actually changed
        if (originalProduct && originalProduct.sortOrder !== product.sortOrder) {
          await updateSortOrderMutation.mutateAsync({
            productId: product.id,
            sortOrder: product.sortOrder,
          });
        }
      }
      
      // Force refresh the data after all updates are complete
      // Invalidate the specific query being used
      await queryClient.invalidateQueries({ 
        queryKey: ["getProductsBySubcategory", subcategoryId, { page }] 
      });
      // Invalidate all queries for this subcategory (different pages)
      await queryClient.invalidateQueries({ 
        queryKey: ["getProductsBySubcategory", subcategoryId] 
      });
      // Invalidate general product queries
      await queryClient.invalidateQueries({ queryKey: ["getAllProducts"] });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      
      // Also refetch the current query to ensure UI updates
      await subcategoryQuery.refetch();
      
      // Update the local state to match the new order (backup approach)
      const freshData = await subcategoryQuery.refetch();
      if (freshData.data?.data?.products) {
        // Sort the fresh data by sortOrder
        const sortedProducts = [...freshData.data.data.products].sort((a, b) => a.sortOrder - b.sortOrder);
        setProducts(sortedProducts);
      }
      
      toast.success("Product order updated successfully");
    } catch (error: any) {
      // Rollback on error
      if (data?.data?.products) {
        setProducts(data.data.products);
      }
      toast.error(error?.response?.data?.message || "Failed to update order", {
        description: error?.response?.data?.message || "Something went wrong"
      });
    }
  };

  const paramBrandId = params.cid || selectedBrandId || "";
  const paramCategoryId = params.id || selectedCategoryId || "";
  const paramSubcategoryId = params.pid || selectedSubcategoryId || "";


  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page") || "1", 10);
    if (urlPage !== page) {
      setPage(urlPage);
    }
  }, [searchParams]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSearchParams({ page: newPage.toString() });
  };

  const subcategoryQuery = useGetProductsBySubcategory(
    subcategoryId,
    { page }
  );




  const { data, isLoading, error } = subcategoryQuery

  const deleteMutation = useDeleteProduct();

  useEffect(() => {
    if (data?.data?.products) {
      // Sort products by sortOrder to ensure correct display order
      const sortedProducts = [...data.data.products].sort((a, b) => a.sortOrder - b.sortOrder);
      setProducts(sortedProducts);
    }
  }, [data]);



  const handleExportPDF = () => {
    setExportFormat("pdf");
    setExportDialogOpen(true);
  };

  const handleExportExcel = () => {
    setExportFormat("excel");
    setExportDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      toast.success("Product deleted successfully");
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete product");
    }
  };

  const handleBulkDelete = async () => {
    try {
      const ids = selectedRows.map(row => row.id);
      await deleteBulkProducts(ids);
      setShowBulkDeleteDialog(false);
      setSelectedRows([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  // Build breadcrumb links based on the URL structure
  const breadcrumbLinks = [
    { label: params?.cid || "Brands", href: "/dashboard/brands" },
    { label: params?.id || "Product Types", href: `/dashboard/category/${params?.cid || ""}` },
    { label: params?.pid || "Categories", href: `/dashboard/category/${params.pid}/subcategory/${params?.id || ""}` },
    { label: "Products", isActive: true },
  ];

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">
              Error loading products: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className=" space-y-6">
      <Breadcrumb links={breadcrumbLinks} />
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
          ) : (
            <>
              <div className="rounded-xs ">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={products.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <DataTable
                      columns={createProductsColumns({ navigate, params, setDeleteId, isSudoAdmin })}
                      DraggableRow={DraggableRow}
                      onRowClick={(row) => {
                        setSelectedProduct(row)
                        navigate(`/dashboard/category/${params?.cid}/subcategory/${params?.id}/products/${params?.pid}/view/${row.id}`);
                      }}
                      data={products}
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
                            onClick={() => {
                              if (paramBrandId && paramCategoryId && paramSubcategoryId) {

                                navigate(`/dashboard/category/${paramBrandId}/subcategory/${paramCategoryId}/${paramSubcategoryId}/products/create`);
                              } else {
                                navigate("/dashboard/products/create");
                              }
                            }}
                          >
                            <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
                            New Product
                          </Button>
                        </div>
                      }
                      pagination={{
                        currentPage: page,
                        totalPages: data?.data?.totalPages || 1,
                        totalItems: data?.data?.total || 0,
                        itemsPerPage: limit,
                        onPageChange: handlePageChange,
                      }}
                    />
                  </SortableContext>
                </DndContext>
              </div>

            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product from the database.
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
            <AlertDialogTitle>delete Items?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRows.length} selected item(s)? This action cannot be undone.
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
