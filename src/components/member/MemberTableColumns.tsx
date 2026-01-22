import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@iconify/react/dist/iconify.js";
import type { Member } from "@/types/team-member";
import { DataTableColumnHeader } from "../data-table-column-header";

interface MemberTableColumnsProps {
  onEdit: (member: Member) => void;
  onView: (member: Member) => void;
  onDelete: (memberId: string) => void;
  isDeletePending?: boolean;
}

export const createMemberColumns = ({
  onEdit,
  onView,
  onDelete,
  isDeletePending,
}: MemberTableColumnsProps): ColumnDef<Member>[] => [
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
      accessorKey: "sortOrder",
      header: () => (
        <div className="text-start font-semibold text-gray-700">S.N.</div>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-gray-600">{row.index + 1}</div>
      ),
    },
    {
      accessorKey: "image",
      header: () => (
        <div className="text-start font-semibold text-gray-700">Image</div>
      ),
      cell: ({ row }) => (
        <div className="w-14 h-14 relative">
          <img
            src={row.original.image || "/placeholder.svg?height=56&width=56"}
            alt={row.original.fullname}
            className="h-14 w-14 object-cover rounded-md"
          />
        </div>
      ),
    },
    {
      accessorKey: "fullname",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Full Name" />
      ),
      cell: ({ row }) => (
        <div className="font-medium text-gray-800">{row.original.fullname}</div>
      ),
    },
    {
      accessorKey: "designation",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Designation" />
      ),
      cell: ({ row }) => (
        <div className="text-gray-600">{row.original.designation}</div>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => (
        <div className="text-gray-600">
          {row.original.countryCode && row.original.phoneNumber
            ? `${row.original.countryCode} ${row.original.phoneNumber}`
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "addToHome",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="On Home Page" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.addToHome ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium  text-green-500">
              <Icon icon="garden:check-badge-fill-12" width="14" />
              Yes
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium  text-gray-500">
              <Icon icon="mdi:close-circle" width="14" />
              No
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "isLeader",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Leader" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.isLeader ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium  text-green-500">
              Leader
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium  text-gray-600">
              Member
            </span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center font-semibold text-gray-700">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center  justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-blue-50"
            onClick={() => onView(row.original)}
            title="View Details"
          >
            <Icon icon="mdi:eye" className="h-4 w-4 text-zinc-300 hover:text-zinc-800" />

          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-green-50"
            onClick={() => onEdit(row.original)}
            title="Edit Member"
          >
            <Icon icon="mdi:pencil" className="h-4 w-4 text-zinc-300 hover:text-zinc-800" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-red-50"
            onClick={() => onDelete(row.original.id)}
            disabled={isDeletePending}
            title="Delete Member"
          >
            <Icon icon="mdi:delete" className="h-4 w-4 text-zinc-300 hover:text-red-500" />
          </Button>
        </div>
      ),
    },
  ];
