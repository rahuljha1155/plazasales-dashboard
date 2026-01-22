import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, Eye, MoreVertical } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import { useToggleSharableActive } from "@/services/sharable";

interface ISharable {
    id: string;
    productId?: string;
    kind: string;
    title: string;
    fileType: string;
    isActive: boolean;
    sortOrder: number;
    extra: string;
    mediaAsset: {
        id: string;
        fileUrl: string;
        type: string;
        sortOrder: number;
        createdAt: string;
        updatedAt: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface CreateSharableColumnsParams {
    onEdit: (sharable: ISharable) => void;
    onView: (sharable: ISharable) => void;
    onDelete: (id: string) => void;
}

export const createSharableColumns = ({
    onEdit,
    onView,
    onDelete,
}: CreateSharableColumnsParams): ColumnDef<ISharable>[] => [
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
        id: "serialNumber",
        header: "S.N.",
        cell: ({ row }) => <div className="font-medium">{row.index + 1}</div>,
    },
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
    },
    {
        accessorKey: "kind",
        header: "Kind",
        cell: ({ row }) => row.original.kind,
    },
    {
        accessorKey: "fileType",
        header: "File Type",
        cell: ({ row }) => row.original.fileType,
    },
    {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => {
            const sharable = row.original;
            const { mutate: toggleActive, isPending } = useToggleSharableActive();

            return (
                <Switch
                    checked={sharable.isActive}
                    onCheckedChange={(checked) => {
                        toggleActive({
                            sharableId: sharable.id,
                            isActive: checked,
                        });
                    }}
                    disabled={isPending}
                />
            );
        },
    },
    {
        accessorKey: "sortOrder",
        header: "Sort Order",
        cell: ({ row }) => row.original.sortOrder,
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const sharable = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 rotate-90 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onView(sharable)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(sharable)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete(sharable.id)}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
