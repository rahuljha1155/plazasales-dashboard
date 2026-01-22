import { Suspense, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogTable } from "@/components/blog/Item-Table";
import { BlogForm } from "@/components/blog/Item-Sheet";
import { TableShimmer } from "@/components/table-shimmer";
import { useGetPaginatedBlogs } from "@/hooks/useBlogs";
import { useGetAllBlogs, useDeleteBulkBlogs } from "@/services/blog";
import type { IBlog } from "@/types/IBlog";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import Breadcrumb from "@/components/dashboard/Breadcumb";
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

export default function BlogPage() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const { data: allBlogs, refetch: refetchAllBlogs } = useGetAllBlogs()
  const [isAdding, setIsAdding] = useState(false);
  const [blogToEdit, setBlogToEdit] = useState<IBlog | null>(null);
  const [selectedRows, setSelectedRows] = useState<IBlog[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const { data, isLoading, refetch: refetchPaginatedBlogs } = useGetPaginatedBlogs(
    pagination.page,
    pagination.limit
  );
  const { mutate: deleteBulkBlogs, isPending: isDeletingBulk } = useDeleteBulkBlogs();

  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

  const handleBulkDelete = () => {
    const blogIds = selectedRows.map((blog) => blog.id);
    deleteBulkBlogs(blogIds);
    setShowBulkDeleteDialog(false);
    setSelectedRows([]);
  };

  return (
    <div className="container mx-auto py-2">
      {isAdding ? (
        <div>
          <div className="mb-6">
            <Breadcrumb links={[{ label: "Blogs", href: "/dashboard/blogs", handleClick: () => setIsAdding(false) }, { label: "Add Blog", isActive: true }]} />
          </div>

          <BlogForm
            onSuccess={() => {
              setIsAdding(false);
              refetchAllBlogs();
              refetchPaginatedBlogs();
            }}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      ) : blogToEdit ? (
        <div>
          <div className="flex items-center justify-between mb-8">
            <Breadcrumb links={[{ label: "Blogs", handleClick: () => setBlogToEdit(null) }, { label: blogToEdit?.slug || "", handleClick: () => setBlogToEdit(null) }, { label: "View", isActive: true }]} />
          </div>
          <BlogForm
            blog={blogToEdit}
            onSuccess={() => {
              setBlogToEdit(null);
              refetchAllBlogs();
              refetchPaginatedBlogs();
            }}
            onCancel={() => setBlogToEdit(null)}
          />
        </div>
      ) : (
        <>

          {allBlogs?.data?.blogs?.length === 0 && (
            <Button
              className="rounded-sm hover:shadow-md transition-shadow"
              onClick={() => setIsAdding(true)}
            >
              <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
              New Blog
            </Button>
          )}

          <Suspense fallback={<TableShimmer />}>
            <BlogTable
              blogs={allBlogs?.data?.blogs || []}
              isLoading={isLoading}
              onEdit={setBlogToEdit}
              onRowSelectionChange={(rows: IBlog[]) => setSelectedRows(rows)}
              element={
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
                      onClick={() => navigate("/dashboard/deleted-blogs")}
                    >
                      <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
                      View Deleted
                    </Button>
                  )}
                  <Button
                    className="rounded-sm hover:shadow-md transition-shadow"
                    onClick={() => setIsAdding(true)}
                  >
                    <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
                    New Blog
                  </Button>
                </div>
              }
              pagination={{
                total: data?.total || 0,
                totalPages: data?.totalPages || 1,
                currentPage: data?.currentPage || 1,
                itemsPerPage: data?.itemsPerPage || 10,
                hasNextPage: data?.hasNextPage || false,
                hasPreviousPage: data?.hasPreviousPage || false,
                nextPage: data?.nextPage || undefined,
                previousPage: data?.previousPage || undefined,
              }}
              onPageChange={(newPage) => {
                setPagination((prev) => ({ ...prev, page: newPage }));
              }}

            />
          </Suspense>
        </>
      )}

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedRows.length} blog{selectedRows.length > 1 ? 's' : ''}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingBulk}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeletingBulk}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingBulk ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
