import { DataTableColumnHeader } from "@/components/data-table-column-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@iconify/react";

import type { ColumnDef, Table } from "@tanstack/react-table";
import type { ICareer } from "@/types/ICareer";
import { Link } from "react-router-dom";

// Define the meta type for DataTable
interface CareerTableMeta {
  onEdit: (career: ICareer) => void;
  onView: (career: ICareer) => void;
  setDeleteId: (id: string) => void;
}

export const careerTableColumns: ColumnDef<ICareer>[] = [
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
    size: 40,
  },
  {
    accessorKey: "sn",
    header: ({ column }) => <DataTableColumnHeader column={column} title="S.N" />,
    cell: ({ row }) => row.index + 1,
    size: 40,
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Title" />,
    cell: ({ row }) => row.original.title,
  },
  {
    accessorKey: "location",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
    cell: ({ row }) => row.original.location || "N/A",
  },
  {
    accessorKey: "jobType",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Job Type" />,
    cell: ({ row }) => {
      const jobType = row.original.jobType;
      const labels: Record<string, string> = {
        "FULL_TIME": "Full Time",
        "full-time": "Full Time",
        "PART_TIME": "Part Time",
        "part-time": "Part Time",
        "CONTRACT": "Contract",
        "contract": "Contract",
        "INTERNSHIP": "Internship",
        "internship": "Internship",
        "REMOTE": "Remote",
        "remote": "Remote",
      };
      return labels[jobType || ""] || jobType || "N/A";
    },
  },
  {
    accessorKey: "salaryRange",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Salary Range" />,
    cell: ({ row }) => row.original.salaryRange || "Not specified",
  },
  {
    id: "applications",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Applications" />,
    cell: ({ row }) => (
      <Link to={`/dashboard/applications?id=${encodeURIComponent(row.original.id)}&&position=${encodeURIComponent(row.original.slug as string)}`}>
        <Button
          variant="outline"
          size="sm"
          className="text-xs text-zinc-400 hover:bg-primary hover:text-white"
        >
          <Icon icon="mdi:eye" className="mr-1" width="14" />
          View Applications
        </Button>
      </Link>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Actions" />,
    cell: ({ row, table }) => {
      // Type assertion for meta to ensure correct types
      const meta = (table.options.meta || {}) as CareerTableMeta;
      return (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => meta.onView(row.original)}
            title="View"
          >
            <Icon icon="mynaui:eye" width="16" height="16" className="text-zinc-400 hover:text-red-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => meta.onEdit(row.original)}
            title="Edit"
          >
            <Icon icon="mynaui:edit-one" width="16" height="16" className="text-zinc-400 hover:text-red-500" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => meta.setDeleteId(row.original.id)}
            title="Delete"
          >
            <Icon icon="ic:baseline-delete" width="16" height="16" className="text-zinc-400 hover:text-red-500" />
          </Button>
        </div>
      );
    },
    enableSorting: false,
  },
];
