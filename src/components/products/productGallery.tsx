import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  type ColumnDef,
} from "@tanstack/react-table";
import { useDeleteGallery, useDeleteBulkGalleries } from "@/hooks/useGallery";
import { useGetProductById } from "@/hooks/useProduct";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Trash2,
  Eye,
  Edit,
  MoreHorizontal,
  Loader,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import GalleryForm from "@/components/products/galleryForm";
import Breadcrumb from "../dashboard/Breadcumb";
import { useSelectedDataStore } from "@/store/selectedStore";
import { TableShimmer } from "../table-shimmer";
import { DataTable } from "@/components/ui/data-table";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";

// Interface for gallery data from product
export interface MediaAsset {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  fileUrl: string;
  type: "IMAGE" | "VIDEO" | "AUDIO";
}

export interface Gallery {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  caption: string;
  isHome: boolean;
  productId?: string;
  mediaAsset: MediaAsset[];
}


export default function ProductGallery() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;
  const [viewGallery, setViewGallery] = useState<Gallery | null>(null);
  const [editGallery, setEditGallery] = useState<Gallery | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<Gallery[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const { selectedBrand, selectedCategory, selectedSubcategory, selectedProduct } = useSelectedDataStore()

  const { data: productData, isLoading: productLoading } = useGetProductById(
    id || ""
  );
  const { mutateAsync: deleteGallery, isPending: isDeleting } = useDeleteGallery(id);
  const { mutateAsync: deleteBulkGalleries, isPending: isBulkDeleting } = useDeleteBulkGalleries(id);

  const handleBulkDelete = async () => {
    try {
      const ids = selectedRows.map(row => row.id);
      await deleteBulkGalleries(ids);
      setShowBulkDeleteDialog(false);
      setSelectedRows([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete galleries");
    }
  };

  const handleDelete = async (galleryId: string) => {
    try {
      setDeletingId(galleryId);
      await deleteGallery(galleryId);
      toast.success("Gallery deleted successfully");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to delete gallery"
      );
    }
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setEditGallery(null);
  };

  const product = productData?.product;
  const galleries = product?.gallery || [];

  const columns: ColumnDef<Gallery>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="ml-2"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: "S.N.",
      cell: ({ row }) => <div>{parseInt(row.id) + 1}</div>,
    },
    {
      id: "preview",
      accessorKey: "mediaAsset",
      header: "Preview",
      cell: ({ row }) => {
        const gallery = row.original;
        const firstAsset = gallery.mediaAsset[0];
        return (
          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
            {firstAsset ? (
              firstAsset.type === "IMAGE" ? (
                <img
                  src={firstAsset.fileUrl}
                  alt={gallery.caption}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={firstAsset.fileUrl}
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                No Image
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "caption",
      header: "Caption",
    },

    {
      id: "mediaCount",
      accessorKey: "mediaAsset",
      header: "Media Count",
      cell: ({ row }) => {
        const count = row.original.mediaAsset.length;
        return (
          <span className="text-sm text-gray-600">
            {count} {count === 1 ? "item" : "items"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const gallery = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                {deletingId === gallery.id && isDeleting ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => setViewGallery(gallery)}
              >
                <Eye className="w-4 h-4" />
                View Gallery
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => setEditGallery(gallery)}
              >
                <Edit className="w-4 h-4" />
                Edit Gallery
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <span className="flex cursor-pointer items-center text-sm text-red-500 gap-2 p-2 hover:bg-red-100 rounded">
                    <Trash2 className="w-4 h-4" />
                    Delete Gallery
                  </span>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. It will permanently delete
                      the gallery from the database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-500 hover:bg-red-600"
                      onClick={() => handleDelete(gallery.id)}
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (productLoading) {
    return (
      <div className="">
        <TableShimmer />
      </div>
    );
  }

  // Build breadcrumb links based on the URL structure
  const breadcrumbLinks = [
    { label: selectedBrand?.name || "Brands", href: "/dashboard/brands" },
    { label: selectedCategory?.title || "Product Types", href: `/dashboard/category/${selectedBrand?.slug || ""}` },
    { label: selectedSubcategory?.title || "Categories", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}` },
    { label: selectedProduct?.name || "Products", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}/products/${selectedSubcategory?.slug || selectedSubcategory?.original?.slug || ""}` },
    { label: "Gallery", isActive: true },
  ];

  return (
    <div className=" space-y-6">
      <Breadcrumb links={breadcrumbLinks} />
      <Card className="">
        <CardContent className="px-0">
          <DataTable
            columns={columns}
            data={galleries}
            filterColumn="caption"
            filterPlaceholder="Filter by caption..."
            onRowSelectionChange={(rows) => setSelectedRows(rows as Gallery[])}
            pagination={{
              currentPage: 1,
              totalPages: 1,
              totalItems: galleries.length,
              itemsPerPage: galleries.length,
              onPageChange: () => { },
            }}
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
                    onClick={() => navigate("/dashboard/products/gallery/deleted")}
                  >
                    <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4 mr-2" />
                    View Deleted
                  </Button>
                )}
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Gallery
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>

      {/* Create Gallery Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Gallery</DialogTitle>
            <DialogDescription>
              Upload images for {product?.name}
            </DialogDescription>
          </DialogHeader>
          <GalleryForm
            productId={id || ""}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Gallery Dialog */}
      <Dialog open={!!editGallery} onOpenChange={() => setEditGallery(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Gallery</DialogTitle>
            <DialogDescription>
              Update gallery for {product?.name}
            </DialogDescription>
          </DialogHeader>
          <GalleryForm
            productId={id || ""}
            gallery={editGallery ? {
              ...editGallery,
              productId: editGallery.productId || id || "",
              mediaAsset: editGallery.mediaAsset.map(asset => asset.fileUrl)
            } as any : undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setEditGallery(null)}
          />
        </DialogContent>
      </Dialog>

      {/* View Gallery Dialog */}
      <Dialog open={!!viewGallery} onOpenChange={() => setViewGallery(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="capitalize">{viewGallery?.caption}</DialogTitle>
            <DialogDescription>
              View all media assets in this gallery
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {viewGallery?.mediaAsset?.map((asset, index) => (
              <img
                key={asset.id || index}
                src={asset.fileUrl}
                alt={`${viewGallery.caption} - ${index + 1}`}
                className="w-full h-auto rounded-lg"
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

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

    </div>
  );
}
