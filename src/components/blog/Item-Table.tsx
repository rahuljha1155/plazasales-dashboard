import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader, Eye } from "lucide-react";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "sonner";
import { TableShimmer } from "../table-shimmer";
import type { IBlog } from "@/types/IBlog";
import { useDeleteBlog } from "@/hooks/useBlogs";
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
} from "../ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@iconify/react/dist/iconify.js";
import Breadcrumb from "../dashboard/Breadcumb";

interface BlogTableProps {
  blogs: IBlog[];
  isLoading: boolean;
  onEdit: (blog: IBlog) => void;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextPage?: number;
    previousPage?: number;
  };
  onPageChange: (page: number) => void;
  element?: React.ReactNode;
  onRowSelectionChange?: (selectedRows: IBlog[]) => void;
}

export function BlogTable({
  blogs,
  isLoading,
  onEdit,
  pagination,
  onPageChange,
  element,
  onRowSelectionChange,
}: BlogTableProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<IBlog | null>(null);
  const { mutate: deleteBlog, isPending } = useDeleteBlog();

  const handleDelete = async (blogId: string) => {
    await deleteBlog(blogId, {
      onSuccess: () => {
        toast("Blog deleted successfully");
        setDeleteDialogOpen(false);
      },
      onError: () => {
        toast("Failed to delete blog");
      },
    });
  };

  const columns: ColumnDef<IBlog>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          className="ml-3"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          className="ml-3"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "sn",
      header: ({ column }) => <div className="text-start">S.N.</div>,
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "coverImage",
      header: "Banner",
      cell: ({ row }) => (
        <img
          src={row.original.coverImage || "/brokenimg.jpg"}
          alt={row.original.title}
          width={40}
          height={40}
          className="h-10 w-10 object-cover rounded"
        />
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium line-clamp-1">{row.getValue("title")}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-600">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },

    {
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        const blog = row.original;
        const { user } = useUserStore();
        const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>


            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                >
                  <Icon
                    icon="solar:menu-dots-bold"
                    width="18"
                    height="18"
                    className="text-gray-500"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex justify-start">
                  <button
                    onClick={() => navigate(`/dashboard/blog/${blog.id}`)}
                    className="cursor-pointer flex justify-start hover:bg-transparent w-full gap-2"
                    title="View blog"
                  >
                    <Eye className="h-4 w-4 text-zinc-400 hover:text-blue-500" /> View
                  </button>

                </DropdownMenuItem>
                <DropdownMenuItem>
                  <button
                    onClick={() => onEdit(blog)}
                    className="cursor-pointer flex gap-2 items-center hover:bg-transparent w-full "
                    title="Edit blog"
                  >
                    <Icon
                      icon="mynaui:edit-one"
                      width="16"
                      height="16"
                      className="text-zinc-400  hover:text-primary"
                    />
                    Edit
                  </button>
                </DropdownMenuItem>
                {isSudoAdmin && (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/dashboard/blogs/${blog.id}/seo`)
                      }
                      className="flex gap-2 items-center"
                    >
                      <Icon icon="solar:magnifer-bold" className="text-gray-500" width="16" />
                      SEO Optimization
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="flex cursor-pointer select-none items-center px-2 py-1.5 text-sm text-red-600 hover:bg-accent rounded-sm">
                      <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
                      Delete Blog
                    </div>
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
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => handleDelete(blog.id)}
                      >
                        {isPending ? (
                          <Loader className="h-5 w-5 animate-spin" />
                        ) : (
                          "Confirm"
                        )}
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

  if (isLoading) {
    return <TableShimmer />;
  }



  return (
    <>
      <Breadcrumb links={[
        { label: "Blogs", isActive: false },
        { label: "View All", isActive: true },
      ]} />
      <br className="my-4" />
      <DataTable
        columns={columns}
        data={blogs}
        onRowClick={(blog) => navigate(`/dashboard/blog/${blog.id}`)}
        elements={element}
        filterColumn="title"
        filterPlaceholder="Filter blogs..."
        pagination={{
          totalItems: pagination.total,
          currentPage: pagination.currentPage,
          itemsPerPage: pagination.itemsPerPage,
          onPageChange: onPageChange,
          totalPages: pagination.totalPages,
        }}
        onRowSelectionChange={onRowSelectionChange}
      />


    </>
  );
}
