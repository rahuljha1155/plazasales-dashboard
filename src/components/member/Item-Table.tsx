"use client";

import { useState, useEffect } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell } from "@/components/ui/table";
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
import { toast } from "sonner";
import { TableShimmer } from "../table-shimmer";
import { useDeleteTeamMember, useUpdateTeamMemberSortOrder } from "@/hooks/useTeam";
import { MemberSheet } from "./Iteam-Sheet";
import { Icon } from "@iconify/react/dist/iconify.js";
import { SortableTable } from "./SortableTable";
import { useGetAllTeamMembers } from "@/services/teammember";
import type { IMember, ITeamMember } from "@/types/ITeammember";

interface TableProps {
  members: any[];
  isLoading: boolean;
  onEdit: any;
  onView: (member: IMember) => void;
}

export function MemberTable({ members, isLoading, onEdit, onView }: TableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<ITeamMember | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<ITeamMember | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [localMembers, setLocalMembers] = useState<IMember[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const { data: allMembers } = useGetAllTeamMembers();

  useEffect(() => {
    setLocalMembers(allMembers?.data.members || []);
    setHasChanges(false);
  }, [allMembers]);

  const { mutate: deleteMember, isPending } = useDeleteTeamMember();
  const { mutate: updateSortOrder, isPending: isUpdatingSort } = useUpdateTeamMemberSortOrder();

  const handleDelete = async (memberId: string) => {
    await deleteMember(memberId, {
      onSuccess: () => {
        toast("Team member deleted successfully");
        setDeleteDialogOpen(false);
      },
      onError: () => {
        toast("Failed to delete team member");
      },
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = localMembers.findIndex((member) => member?.id === active.id);
      const newIndex = localMembers.findIndex((member) => member?.id === over?.id);

      const newMembers = arrayMove(localMembers, oldIndex, newIndex);
      setLocalMembers(newMembers);
      setHasChanges(true);
    }
  };

  const handleSaveSortOrder = () => {
    const membersWithSortOrder = localMembers.map((member, index) => ({
      id: member?.id,
      sortOrder: index,
    }));

    updateSortOrder(
      { members: membersWithSortOrder },
      {
        onSuccess: () => {
          toast.success("Sort order updated successfully");
          setHasChanges(false);
        },
        onError: () => {
          toast.error("Failed to update sort order");
        },
      }
    );
  };

  const handleResetOrder = () => {
    setLocalMembers(members);
    setHasChanges(false);
  };

  if (isLoading) {
    return <TableShimmer />;
  }

  return (
    <>


      <SortableTable
        members={localMembers || []}
        onDragEnd={handleDragEnd}
        onRowClick={onView}
        renderRow={(member, index) => (
          <>
            <TableCell>
              <Checkbox
                className=""
                checked={false}
                aria-label="Select row"
              />
            </TableCell>
            <TableCell className="text-center text-zinc-700">{index + 1}</TableCell>
            <TableCell>
              <img
                src={member?.image || "/placeholder.svg"}
                alt={member?.fullname}
                width={40}
                height={40}
                className="h-10 w-10 object-cover rounded-full border-2 border-orange-600"
              />
            </TableCell>
            <TableCell className="font-medium">{member?.fullname}</TableCell>
            <TableCell>{member?.designation}</TableCell>
            {/* <TableCell className="capitalize">{member}</TableCell> */}
            <TableCell>
              {member?.countryCode && member?.phoneNumber
                ? `${member?.countryCode} ${member?.phoneNumber}`
                : "N/A"}
            </TableCell>
            <TableCell>
              <div className="flex justify-center items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(member)}
                  className="hover:bg-transparent text-zinc-400 hover:text-blue-600 cursor-pointer"
                >
                  <Icon icon="mdi:eye" width="16" height="16" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(member)}
                  className="hover:bg-transparent text-zinc-400 hover:text-orange-600 cursor-pointer"
                >
                  <Icon icon="mynaui:edit-one" width="16" height="16" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      className="hover:bg-transparent text-zinc-400 hover:text-red-500 cursor-pointer"
                    >
                      <Icon icon="ic:baseline-delete" width="16" height="16" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. It will permanently delete the selected item.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 flex gap-1 items-center text-red-100 hover:bg-red-600"
                        onClick={() => handleDelete(member?.id)}
                      >
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </>
        )}
      />

      {/* Save Changes Controls */}
      {hasChanges && (
        <div className="flex justify-between items-center my-4">
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-sm border border-orange-200">
            <Icon icon="material-symbols:drag-indicator" className="text-orange-600" />
            <span className="text-sm text-orange-700 font-medium">
              You have unsaved changes in the member order
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleResetOrder}
              disabled={isUpdatingSort}
              className="text-gray-600"
            >
              Reset
            </Button>
            <Button
              onClick={handleSaveSortOrder}
              disabled={isUpdatingSort}
              className="bg-primary hover:bg-orange-700"
            >
              {isUpdatingSort ? "Saving..." : "Save Order"}
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              <span className="text-black font-semibold text-md">
                {memberToDelete?.name}
              </span>{" "}
              team member and all their data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={() => memberToDelete && memberToDelete._id && handleDelete(memberToDelete._id)}
            >
              {"Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedMember && (
        <MemberSheet
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              setSelectedMember(null);
            }
          }}
          member={selectedMember}
          onSuccess={() => {
            setEditDialogOpen(false);
            setSelectedMember(null);
          }}
        />
      )}
    </>
  );
}
