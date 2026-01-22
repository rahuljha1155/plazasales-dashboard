import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { IDeletedApplication } from "@/types/IApplication";
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

interface DeletedApplicationColumnsProps {
  onRecover: (id: string) => void;
  onDestroyPermanently: (id: string) => void;
  isRecoverPending: boolean;
  isDestroyPending: boolean;
}

export function createDeletedApplicationColumns({
  onRecover,
  onDestroyPermanently,
  isRecoverPending,
  isDestroyPending,
}: DeletedApplicationColumnsProps): ColumnDef<IDeletedApplication>[] {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-500", label: "Pending" },
      REVIEWED: { color: "bg-blue-500", label: "Reviewed" },
      ACCEPTED: { color: "bg-green-500", label: "Accepted" },
      REJECTED: { color: "bg-red-500", label: "Rejected" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <Badge className={`${config.color} py-0.5! text-white hover:${config.color}`}>
        {config.label}
      </Badge>
    );
  };

  return [
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
      cell: ({ row }) => getStatusBadge(row.original.status),
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRecover(row.original.id)}
            disabled={isRecoverPending}
            className="text-green-600 hover:bg-green-50 hover:border-green-600"
          >
            <Icon icon="solar:refresh-bold" className="mr-1" width="16" />
            Recover
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isDestroyPending}
                className="text-red-600 hover:bg-red-50 hover:border-red-600"
              >
                <Icon icon="solar:trash-bin-trash-bold" className="mr-1" width="16" />
                Delete Forever
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Permanently Delete Application</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the application from {row.original.name}. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => onDestroyPermanently(row.original.id)}
                >
                  Delete Forever
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];
}
