import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowRightIcon, Loader, MoreHorizontal, Eye, Edit } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useUserStore } from "@/store/userStore";
import { useSelectionStore } from "@/store/selectionStore";
import { UserRole } from "@/components/LoginPage";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import Breadcumb from "@/components/dashboard/Breadcumb";
import { DataTable } from "../ui/data-table";
import { deleteSubCategory, useGetSubcategoriesByCategoryId, useDeleteBulkSubcategories } from "@/services/subcategory";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TableShimmer } from "../table-shimmer";
import { useSelectedDataStore } from "@/store/selectedStore";

export default function SubcategoryListPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { setSelectedSubcategory } = useSelectedDataStore()
  const { data: categoryData, isLoading, refetch } = useGetSubcategoriesByCategoryId(params.categorySlug || "");

  const [deletingId, setDeletingId] = useState<string>();
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const { mutateAsync: deleteBulkSubcategories, isPending: isBulkDeleting } = useDeleteBulkSubcategories();

  const category = categoryData?.data;
  const subcategories = category?.subCategories || [];
  const categoryId = category?.subCategories?.[0]?.category?.slug || params?.categorySlug || "";
  const brandId = category?.subCategories?.[0]?.category?.brand?.id || "";
  const brandSlug = params.brandSlug;
  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

  const deleteSubcategoryHandler = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteSubCategory(id);
      toast.success("Subcategory deleted successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete subcategory");
    } finally {
      setDeletingId(undefined);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const ids = selectedRows.map(row => row.id);
      await deleteBulkSubcategories(ids);
      setShowBulkDeleteDialog(false);
      setSelectedRows([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          className="ml-2"
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "sortOrder",
      header: () => <div className="font-medium">S.N.</div>,
      cell: ({ row }) => (
        <div className="text-foreground">{row.index + 1}</div>
      ),
    },
    {
      accessorKey: "coverImage",
      header: "Cover Image",
      cell: ({ row }) => (
        <Avatar className="bg-gray-100 h-10 w-10 object-scale-down">
          <AvatarImage
            src={row.original.coverImage}
            alt="subcategory-image"
            className="object-cover"
          />
          <AvatarFallback className="bg-gray-100 h-10 w-10 object-scale-down text-foreground/65">
            NA
          </AvatarFallback>
        </Avatar>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
    },
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Slug <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm text-muted-foreground">
          {row.getValue("slug")}
        </div>
      ),
    },
    {
      id: "contents",
      header: "View Contents",
      enableHiding: false,
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Link
            to={`/dashboard/category/${brandSlug}/subcategory/${params.categorySlug}/products/${row.original.slug}`}
            onClick={() => {
              setSelectedSubcategory(row?.original)
            }}
          >
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm text-neutral-500 hover:bg-primary hover:text-white cursor-pointer hover:border-primary transition-colors"
            >
              <Icon icon="solar:eye-bold" className="mr-1.5" width="16" />
              View Products
            </Button>
          </Link>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const item = row.original;

        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>


            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  {deletingId === item.id ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <Link
                  to={`/dashboard/category/${brandSlug}/subcategory/${params.categorySlug}/view/${item?.slug}`}
                  onClick={() => {
                    useSelectionStore.getState().setSelection({
                      brandId: brandId,
                      categoryId: categoryId,
                      subcategoryId: item.id,
                    });
                    setSelectedSubcategory(item)
                  }}
                >
                  <Button variant="ghost" size="sm" className="h-8">
                    <Eye className="h-4 w-4 mr-1" />
                    View Category
                  </Button>
                </Link>
                <Link
                  to={`/dashboard/category/${brandSlug}/subcategory/${categoryId}/edit/${item.id}`}
                  onClick={() => {
                    useSelectionStore.getState().setSelection({
                      brandId: brandId,
                      categoryId: categoryId,
                      subcategoryId: item.id,
                    });
                    setSelectedSubcategory(item)

                  }}
                >
                  <span className="flex cursor-pointer select-none items-center px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Category
                  </span>
                </Link>
                {isSudoAdmin && (
                  <span
                    className="flex cursor-pointer select-none items-center px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                    onClick={() =>
                      navigate(`/dashboard/subcategories/${item.id}/seo`)
                    }
                  >
                    <Icon icon="lucide:search" className="h-4 w-4 mr-2" />
                    SEO Optimization
                  </span>
                )}
                <span
                  className="flex cursor-pointer select-none items-center px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                  onClick={() =>
                    navigate(`/dashboard/subcategories/${item.id}/ads`)
                  }
                >
                  <Icon icon="solar:widget-5-bold" className="h-4 w-4 mr-2" />
                  Manage Ads
                </span>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <span className="flex cursor-pointer select-none items-center px-2 py-1.5 text-sm text-red-500/90 hover:bg-accent rounded-sm">
                      <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                      Delete Subcategory
                    </span>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. It will permanently delete the selected item.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500/90 hover:bg-red-500"
                        onClick={() => deleteSubcategoryHandler(item.id)}
                      >
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const breadcrumbLinks = [
    { label: brandSlug || "Brands", href: "/dashboard/brands" },
    { label: params?.categorySlug || "Product Type", href: `/dashboard/category/${brandSlug}` },
    { label: "Product category ", isActive: true },
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
      <div className="flex justify-between items-center  pb-4">
        <Breadcumb links={breadcrumbLinks} />

      </div>
      <div className="space-y-4">
        <DataTable
          columns={columns}
          filterColumn="title"
          onRowClick={(row) => {
            setSelectedSubcategory(row)
            navigate(`/dashboard/category/${brandSlug}/subcategory/${params.categorySlug}/products/${row.slug}`);
          }}
          onRowSelectionChange={(rows: any) => setSelectedRows(rows)}
          filterPlaceholder="Search subcategories..."
          data={subcategories}
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
                  onClick={() => navigate("/dashboard/deleted-subcategories")}
                >
                  <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                  View Deleted
                </Button>

              )}
              <Button
                className="rounded-sm hover:shadow-md transition-shadow"
                onClick={() => {
                  useSelectionStore.getState().setSelection({
                    brandId: brandId,
                    categoryId: categoryId,
                    subcategoryId: null,
                  });
                  navigate(`/dashboard/category/${brandSlug}/subcategory/${categoryId}/create`);
                }}
              >
                <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
                New Category
              </Button>

            </div>
          }
          pagination={{
            itemsPerPage: 10,
            currentPage: 1,
            totalItems: subcategories.length,
            totalPages: Math.ceil(subcategories.length / 10),
            onPageChange: (page) => {
            },
            onItemsPerPageChange: (itemsPerPage) => {
            },
            showItemsPerPage: true,
            showPageInput: true,
            showPageInfo: true,
          }}
        />
      </div>

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>delete Subcategories?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRows.length} selected subcategory(s)? This action cannot be undone.
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
