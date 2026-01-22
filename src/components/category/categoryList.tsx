import { useState, useEffect } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Loader,
  MoreHorizontal,
  Eye,
  Edit,
  Search,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams, useNavigate, href } from "react-router-dom";
import { toast } from "sonner";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useSelectionStore } from "@/store/selectionStore";

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
import { api } from "@/services/api";
import { SubCategoryForm } from "./SubCategoryForm";
import { DataTable } from "../ui/data-table";
import { useDeleteCategory, useGetCategoryByBrand, useDeleteBulkCategories } from "@/services/category";
import { useGetBrandBySlug } from "@/services/brand";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import { useSelectedDataStore } from "@/store/selectedStore";

type ViewMode = "view" | "create" | "edit";

export default function SubCategoryPage() {
  const params = useParams();
  const { setSelectedCategory } = useSelectedDataStore()
  const brandSlug = params?.id; // This is actually the brand slug from URL
  const navigate = useNavigate();
  const { user } = useUserStore();
  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // First, fetch brand by slug to get the actual brand ID
  const { data: brandData, isLoading: isBrandLoading } = useGetBrandBySlug(brandSlug || "");
  const brandId = brandData?.brand?.id || "";

  // Then use the brand ID to fetch categories
  const { data: collection, error, isLoading: isCategoriesLoading } = useGetCategoryByBrand(brandId, page, limit);
  const isLoading = isBrandLoading || isCategoriesLoading;
  const [categories, setCategories] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string>();
  const [mode, setMode] = useState<ViewMode>("view");
  const [currentSubcategory, setCurrentSubcategory] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const { mutateAsync: deleteBulkCategories, isPending: isBulkDeleting } = useDeleteBulkCategories();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((i) => i.categoryId === active.id);
    const newIndex = categories.findIndex((i) => i.categoryId === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);

    try {
      await updateCategoryOrder(
        categories[oldIndex].categoryId,
        categories[newIndex].categoryId
      );
      toast.success("Sub Category sortOrder updated successfully");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update order",
        {
          description: e?.response?.data?.message || "Something went wrong"
        }
      );
      setCategories(categories); // rollback
    }


  };

  const updateCategoryOrder = async (
    draggedCategoryId: string,
    targetCategoryId: string
  ) => {
    return api.put(`/categories/reorder`, {
      draggedCategoryId,
      targetCategoryId,
      brandId: params.id,
    });
  };

  useEffect(() => {
    if (collection?.data?.categories) {
      setCategories(collection.data.categories);
    }
  }, [collection]);

  useEffect(() => {
    if (error) {
      toast.error("Error fetching categories", {
        description: error.message || "Something went wrong"
      });
    }
  }, [error]);

  const { mutate: deleteCat, isPending: isDeletingCategory } = useDeleteCategory();

  const deleteCategory = (id: string) => {
    setDeletingId(id);
    deleteCat(id, {
      onSuccess: () => {
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
        toast.success("Category deleted successfully");
        setDeletingId(undefined);
      },
      onError: () => {
        setDeletingId(undefined);
      },
    });
  };

  const handleBulkDelete = async () => {
    try {
      const ids = selectedRows.map(row => row.id);
      await deleteBulkCategories(ids);
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
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          className="ml-2"
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
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium max-w-xl line-clamp-1">{row.getValue("title")}</div>,
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
        <div className="font-mono max-w-50 line-clamp-1 text-sm text-muted-foreground">
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
            onClick={() => {
              setSelectedCategory(row.original)
            }}
            to={`/dashboard/category/${brandSlug}/subcategory/${row.original.slug}`}
          >
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm text-neutral-500 hover:bg-primary hover:text-white cursor-pointer hover:border-primary transition-colors"
            >
              <Icon icon="solar:eye-bold" className="mr-1.5" width="16" />
              View Category
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
                  {deletingId === item.id && isDeletingCategory ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <Link
                  to={`/dashboard/category/${brandSlug}/edit/${item.slug}`}
                  onClick={() => {
                    useSelectionStore.getState().setSelection({
                      brandId: brandId,
                      categoryId: item.id,
                    });
                  }}
                >
                  <span className="flex cursor-pointer select-none items-center px-2 py-1.5 text-sm hover:bg-accent rounded-sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Product Type
                  </span>
                </Link>
                {isSudoAdmin && (
                  <span
                    className="flex cursor-pointer select-none items-center px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                    onClick={() =>
                      navigate(`/dashboard/categories/${item.slug}/seo`)
                    }
                  >
                    <Search className="h-4 w-4 mr-2" />
                    SEO Optimization
                  </span>
                )}
                <span
                  className="flex cursor-pointer select-none items-center px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                  onClick={() =>
                    navigate(`/dashboard/categories/${item.slug}/ads`)
                  }
                >
                  <Icon icon="solar:widget-5-bold" className="h-4 w-4 mr-2" />
                  Manage Ads
                </span>
                <Link
                  to={`/dashboard/category/${brandSlug}/view/${item.slug}`}
                  onClick={() => {
                    useSelectionStore.getState().setSelection({
                      brandId: brandId,
                      categoryId: item.id,
                    });
                  }}
                >
                  <button className="text-sm p-2 hover:bg-zinc-100 cursor-pointer flex gap-2 items-center border-none font-medium! outline-none">
                    <Eye className="h-4 w-4 mr-1" />
                    <span className="font-medium!">View Details</span>
                  </button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <span className="flex cursor-pointer select-none items-center px-2 py-1.5 text-sm text-red-500/90 hover:bg-accent rounded-sm">
                      <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                      Delete Category
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
                        onClick={() => deleteCategory(item.id)}
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

  const getBreadcrumbLinks = () => {
    const baseLinks = [
      {
        label: brandData?.brand?.name || "Brands",
        href: "/dashboard/brands"
      },
      {
        label: "Product Types",
        isActive: mode === "view",
        href: "#"
      },
    ];

    if (mode === "create") {
      return [
        ...baseLinks,
        {
          label: "Create",
          isActive: true,
        },
      ];
    }

    if (mode === "edit") {
      return [
        ...baseLinks,
        {
          label: "Edit",
          isActive: true,
        },
      ];
    }

    return baseLinks;
  };



  // Handle subcategory create mode
  if (mode === "create" && collection?.data?.categories?.[0]) {
    return (
      <div>
        <Breadcumb links={getBreadcrumbLinks()} />
        <SubCategoryForm
          mode="create"
          onClose={() => setMode("view")}
        />
      </div>
    );
  }

  // Main view
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full space-y-6">
        <div className="flex justify-between items-center  pb-4">
          <Breadcumb links={getBreadcrumbLinks()} />

        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-[300px]" />
                <Skeleton className="h-10 w-[100px]" />
              </div>
              <div className="border rounded-md">
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                      <Skeleton className="h-8 w-[100px]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              filterColumn="title"
              onRowClick={(row) => {
                setSelectedCategory(row)
                navigate(`/dashboard/category/${brandSlug}/subcategory/${row.slug}`);
              }}
              onRowSelectionChange={(rows: any) => setSelectedRows(rows)}
              filterPlaceholder="Search categories..."
              data={categories}
              pagination={{
                itemsPerPage: limit,
                currentPage: page,
                totalItems: collection?.data?.total || 0,
                totalPages: collection?.data?.totalPages || 1,
                onPageChange: (newPage) => {
                  setPage(newPage);
                },
                onItemsPerPageChange: (newLimit) => {
                  setLimit(newLimit);
                  setPage(1);
                },
                showItemsPerPage: true,
                showPageInput: true,
                showPageInfo: true,
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
                      onClick={() => navigate("/dashboard/deleted-categories")}
                    >
                      <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                      View Deleted
                    </Button>
                  )}

                  <Button
                    className="rounded-sm hover:shadow-md transition-shadow"
                    onClick={() => {
                      useSelectionStore.getState().setSelectedBrandId(params.id as string);
                      navigate(`/dashboard/category/${params.id}/create`);
                    }}
                  >
                    <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
                    Add New
                  </Button>

                </div>
              }
            />
          )}
        </div>
      </div>

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>delete Categories?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRows.length} selected category(s)? This action cannot be undone.
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
    </DndContext>
  );
}
