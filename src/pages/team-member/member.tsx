import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { useGetTeamMembers, useDeleteTeamMember, useDeleteBulkMembers } from "@/hooks/useTeam";
import { DataTable } from "@/components/ui/data-table";
import { createMemberColumns } from "@/components/member/MemberTableColumns";
import type { Member } from "@/types/team-member";
import type { IMember } from "@/types/ITeammember";
import { MemberForm } from "@/components/member/memberform";
import { MemberViewScreen } from "@/components/member/MemberViewScreen";
import { Icon } from "@iconify/react/dist/iconify.js";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { Link } from "react-router-dom";
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
import { TableShimmer } from "@/components/table-shimmer";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";

export default function MembersPage() {
  const {
    data: members,
    isLoading,
    refetch: fetchMembers,
  } = useGetTeamMembers();

  const [isAdding, setIsAdding] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [viewingMember, setViewingMember] = useState<IMember | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Member[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const { mutate: deleteMember, isPending: isDeleting } = useDeleteTeamMember();
  const { mutateAsync: deleteBulkMembers, isPending: isBulkDeleting } = useDeleteBulkMembers();

  const handleDelete = async (memberId: string) => {
    deleteMember(memberId, {
      onSuccess: () => {
        toast.success("Team member deleted successfully");
        setDeleteDialogOpen(false);
        setMemberToDelete(null);
        fetchMembers();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || "Failed to delete team member");
      },
    });
  };

  const handleBulkDelete = async () => {
    try {
      const ids = selectedRows.map((row) => row.id);
      await deleteBulkMembers(ids);
      toast.success(`${ids.length} member(s) deleted successfully`);
      setShowBulkDeleteDialog(false);
      setSelectedRows([]);
      fetchMembers();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete members");
    }
  };

  const handleViewMember = (member: Member) => {
    const iMember: IMember = {
      id: member.id,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
      sortOrder: member.sortOrder,
      addToHome: member.addToHome,
      fullname: member.fullname,
      designation: member.designation,
      image: member.image,
      countryCode: member.countryCode,
      phoneNumber: member.phoneNumber,
      isLeader: member.isLeader,
      description: member.description?.text as any,
      facebook: member.facebook || "",
      twitter: member.twitter || "",
      linkedin: member.linkedin || "",
      instagram: member.instagram || "",
    };
    setViewingMember(iMember);
  };

  const columns = useMemo(
    () =>
      createMemberColumns({
        onEdit: (member) => setMemberToEdit(member as Member),
        onView: handleViewMember,
        onDelete: (memberId) => {
          setMemberToDelete(memberId);
          setDeleteDialogOpen(true);
        },
        isDeletePending: isDeleting,
      }),
    [isDeleting]
  );

  const { user } = useUserStore()

  return (
    <div className="container mx-auto ">

      {viewingMember ? (
        <>
          <div className="flex flex-col pb-4  sm:flex-row sm:items-center sm:justify-between gap-4 ">
            <Breadcrumb
              links={[
                { label: "Teams", handleClick: () => setViewingMember(null) },
                { label: "View Details", isActive: true, },
              ]}
            />
          </div>
          <MemberViewScreen
            memberData={viewingMember}
            onBack={() => setViewingMember(null)}
          />
        </>
      ) : isAdding ? (
        <div>
          <div className="flex  items-center mb-4">
            <div className="flex flex-col  sm:flex-row sm:items-center sm:justify-between gap-4 ">
              <Breadcrumb
                links={[
                  { label: "Teams", handleClick: () => setIsAdding(false) },
                  { label: "Add New", isActive: true, },
                ]}
              />
            </div>
          </div>
          <MemberForm
            onSuccess={() => {
              fetchMembers();
              setIsAdding(false);
            }}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      ) : memberToEdit ? (
        <div>
          <div className="flex flex-col pb-4  sm:flex-row sm:items-center sm:justify-between gap-4 ">
            <Breadcrumb
              links={[
                { label: memberToEdit?.fullname || "Teams", handleClick: () => setMemberToEdit(null) },
                { label: "Edit Details", isActive: true, },
              ]}
            />
          </div>
          <MemberForm
            member={memberToEdit}
            onSuccess={() => {
              fetchMembers();
              setMemberToEdit(null);
            }}
            onCancel={() => setMemberToEdit(null)}
          />
        </div>
      ) : (
        <>

          <div className="flex justify-between items-center mb-4 ">
            <div className="flex flex-col  sm:flex-row sm:items-center sm:justify-between gap-4 ">
              <Breadcrumb
                links={[
                  { label: "Teams" },
                  { label: "View All", isActive: true },
                ]}
              />
            </div>

          </div>

          {isLoading ? (
            <TableShimmer />
          ) : (
            <DataTable
              columns={columns}
              data={members || []}
              filterColumn="fullname"
              filterPlaceholder="Search by name..."
              onRowSelectionChange={(rows: Member[]) => setSelectedRows(rows)}
              onRowClick={row => setViewingMember(row as any)}
              elements={
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
                  <div className="flex gap-3 items-center">
                    {user?.role == UserRole.SUDOADMIN && (<Link to="/dashboard/team-member/deleted">
                      <Button
                        variant="destructive"
                      >
                        <Icon
                          icon="ic:baseline-delete"
                          width="16"
                          height="16"
                          className=" hover:text-red-500"
                        />
                        View Deleted
                      </Button>
                    </Link>)}
                    <Button
                      className="rounded-sm hover:shadow-md transition-shadow"
                      onClick={() => setIsAdding(true)}
                    >
                      <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
                      New Member
                    </Button>
                  </div>


                </div>
              }
              pagination={{
                currentPage: 1,
                totalPages: 1,
                totalItems: members?.length || 0,
                itemsPerPage: members?.length || 10,
                onPageChange: () => { },
              }}
            />
          )}
        </>
      )}

      {/* Single Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this team member? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToDelete && handleDelete(memberToDelete)}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>delete Members?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRows.length} selected member(s)? This action cannot be undone.
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
