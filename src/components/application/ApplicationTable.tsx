import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@iconify/react/dist/iconify.js";
import { format } from "date-fns";
import type { IApplication } from "@/types/IApplication";
import { DataTable } from "@/components/ui/data-table";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

enum ApplicationStatus {
  PENDING = "PENDING",
  REVIEWED = "REVIEWED",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

interface ApplicationTableProps {
  applications: IApplication[];
  isLoading: boolean;
  onView: (application: IApplication) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onReply?: (application: IApplication) => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
  };
  element?: React.ReactNode;
  onRowSelectionChange?: (selectedRows: IApplication[]) => void;
}

export function ApplicationTable({
  applications,
  isLoading,
  onView,
  onDelete,
  onUpdateStatus,
  onReply,
  pagination,
  element,
  onRowSelectionChange
}: ApplicationTableProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);
  const [statusChanges, setStatusChanges] = useState<Record<string, ApplicationStatus>>({});

  const handleDeleteClick = (id: string) => {
    setApplicationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (applicationToDelete) {
      onDelete(applicationToDelete);
      setDeleteDialogOpen(false);
      setApplicationToDelete(null);
    }
  };

  const handleStatusChange = (applicationId: string, newStatus: ApplicationStatus) => {
    setStatusChanges(prev => ({ ...prev, [applicationId]: newStatus }));
  };

  const handleUpdateStatus = (applicationId: string) => {
    const newStatus = statusChanges[applicationId];
    if (newStatus) {
      onUpdateStatus(applicationId, newStatus);
      setStatusChanges(prev => {
        const updated = { ...prev };
        delete updated[applicationId];
        return updated;
      });
    }
  };

  const getCurrentStatus = (applicationId: string, originalStatus: string): ApplicationStatus => {
    return statusChanges[applicationId] || (originalStatus as ApplicationStatus);
  };

  const columns: ColumnDef<IApplication>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
      accessorKey: "name",
      header: "Applicant Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-gray-500">{row.original.email}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.position}</div>
          {row.original.career && (
            <div className="text-xs text-gray-500">{row.original.career.department}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <span className="text-sm">{row.original.phone}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const currentStatus = getCurrentStatus(row.original.id, row.original.status);
        const hasChanged = statusChanges[row.original.id] !== undefined;

        return (
          <div className="flex items-center gap-2">
            <Select
              value={currentStatus}
              onValueChange={(value) => handleStatusChange(row.original.id, value as ApplicationStatus)}
            >
              <SelectTrigger className="w-[130px] rounded-full!">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ApplicationStatus.PENDING}>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    Pending
                  </span>
                </SelectItem>
                <SelectItem value={ApplicationStatus.REVIEWED}>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Reviewed
                  </span>
                </SelectItem>
                <SelectItem value={ApplicationStatus.ACCEPTED}>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Accepted
                  </span>
                </SelectItem>
                <SelectItem value={ApplicationStatus.REJECTED}>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Rejected
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            {hasChanged && (
              <Button
                size="sm"
                onClick={() => handleUpdateStatus(row.original.id)}
                className="h-8.5 rounded-full! bg-green-500!  px-4"
              >
                confirm
              </Button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Applied On",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Icon icon="solar:menu-dots-bold" width="20" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onView(row.original)}>
              <Icon icon="solar:eye-bold" className="mr-2" width="16" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(`/dashboard/applications/${row.original.id}/reply`)}>
              <Icon icon="material-symbols:reply" className="mr-2" width="16" />
              Send Reply
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open(row.original.resumeUrl, "_blank")}
            >
              <Icon icon="solar:document-bold" className="mr-2" width="16" />
              View Resume
            </DropdownMenuItem>
            {row.original.coverLetterUrl && (
              <DropdownMenuItem
                onClick={() => window.open(row.original.coverLetterUrl, "_blank")}
              >
                <Icon icon="solar:document-text-bold" className="mr-2" width="16" />
                View Cover Letter
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDeleteClick(row.original.id)}
            >
              <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        elements={element}
        data={applications}
        filterColumn="name"
        filterPlaceholder="Search by applicant name..."
        pagination={pagination}
        onRowSelectionChange={onRowSelectionChange}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this application? This action can be undone from the deleted applications page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
