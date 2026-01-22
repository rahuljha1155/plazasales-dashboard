import { Suspense, useState } from "react";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

import { TableShimmer } from "@/components/table-shimmer";
import { UserTable } from "@/components/user-management/Item-Table";
import { useGetAllUsers, useDeleteBulkUsers, type User } from "@/hooks/useAdmin";
import { UserViewPage } from "@/components/user-management/UserViewPage";
import { UserEditPage } from "@/components/user-management/UserEditPage";
import { Icon } from "@iconify/react/dist/iconify.js";
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
import { toast } from "sonner";

type PageMode = "list" | "view" | "edit" | "add";

export default function UserManagementPage() {
  const navigate = useNavigate();
  const [pageMode, setPageMode] = useState<PageMode>("list");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data, isLoading } = useGetAllUsers(page, limit);
  const { mutateAsync: deleteBulkUsers, isPending: isBulkDeleting } = useDeleteBulkUsers();
  const [selectedRows, setSelectedRows] = useState<User[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setPageMode("view");
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setPageMode("edit");
  };

  const handleBackToList = () => {
    setPageMode("list");
    setSelectedUser(null);
  };

  const handleBulkDelete = async () => {
    try {
      const ids = selectedRows.map((row) => row.id);
      await deleteBulkUsers(ids);
      toast.success(`${ids.length} user(s) deleted successfully`);
      setShowBulkDeleteDialog(false);
      setSelectedRows([]);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete users");
    }
  };

  if (pageMode === "view" && selectedUser) {
    return <UserViewPage user={selectedUser} onBack={handleBackToList} onEdit={() => setPageMode("edit")} />;
  }

  if (pageMode === "edit" && selectedUser) {
    return <UserEditPage user={selectedUser} onBack={handleBackToList} onSuccess={handleBackToList} />;
  }

  if (pageMode === "add") {
    return <UserEditPage onBack={handleBackToList} onSuccess={handleBackToList} />;
  }

  return (
    <div className="container mx-auto py-4">
      <div className="flex items-center justify-between mb-8">


        <Breadcrumb links={[
          { label: "User Management", isActive: false, href: "/dashboard/user-management", handleClick: () => navigate("/dashboard/user-management") },
          { label: "View All", isActive: true },
        ]} />
      </div>

      <Suspense fallback={<TableShimmer />}>
        <UserTable
          users={data?.users || []}
          isLoading={isLoading}
          element={
            <div className="flex gap-2">
              {selectedRows.length > 0 && (
                <Button
                  variant="destructive"
                  className="rounded-sm hover:shadow-md transition-shadow"
                  onClick={() => setShowBulkDeleteDialog(true)}
                >
                  <Icon
                    icon="solar:trash-bin-minimalistic-bold"
                    className="mr-2"
                    width="20"
                  />
                  delete ({selectedRows.length})
                </Button>
              )}
              <Button className="rounded-md" onClick={() => setPageMode("add")}>
                <Icon icon={"mdi:plus-circle"} className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
          }
          pagination={{
            page: data?.page || 1,
            limit: data?.limit || 10,
            total: data?.total || 0,
            totalPages: data?.totalPages || 1,
          }}
          onPageChange={setPage}
          onViewUser={handleViewUser}
          onEditUser={handleEditUser}
          onRowSelectionChange={(rows: User[]) => setSelectedRows(rows)}
        />
      </Suspense>

      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>delete Users?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRows.length} selected user(s)? This action cannot be undone.
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
