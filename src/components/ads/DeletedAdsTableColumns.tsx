import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@iconify/react/dist/iconify.js";
import { format } from "date-fns";
import type { IAd } from "@/types/IAds";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CreateDeletedAdsColumnsProps {
    onRecover: (ids: string[]) => void;
    onDestroy: (id: string) => void;
    isRecoverPending: boolean;
    isDestroyPending: boolean;
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
}

export const createDeletedAdsColumns = ({
    onRecover,
    onDestroy,
    isRecoverPending,
    isDestroyPending,
    selectedIds,
    onSelectionChange,
}: CreateDeletedAdsColumnsProps): ColumnDef<IAd>[] => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => {
                        table.toggleAllPageRowsSelected(!!value);
                        if (value) {
                            const allIds = table.getRowModel().rows.map((row) => row.original.id);
                            onSelectionChange(allIds);
                        } else {
                            onSelectionChange([]);
                        }
                    }}
                    aria-label="Select all"
                    className="ml-2"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedIds.includes(row.original.id)}
                    onCheckedChange={(value) => {
                        const id = row.original.id;
                        if (value) {
                            onSelectionChange([...selectedIds, id]);
                        } else {
                            onSelectionChange(selectedIds.filter((selectedId) => selectedId !== id));
                        }
                    }}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "bannerUrls",
            header: "Banner",
            cell: ({ row }) => {
                const bannerUrls = row.original.bannerUrls;
                return bannerUrls && bannerUrls.length > 0 ? (
                    <img
                        src={bannerUrls[0]}
                        alt={row.original.title}
                        className="w-20 h-12 object-cover rounded"
                    />
                ) : (
                    <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        No image
                    </div>
                );
            },
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
        },
        {
            accessorKey: "deletedAt",
            header: "Deleted At",
            cell: ({ row }) => (
                <span>
                    {row.original.deletedAt
                        ? format(new Date(row.original.deletedAt), "MMM dd, yyyy")
                        : "-"}
                </span>
            ),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const ad = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Icon icon="solar:menu-dots-bold" width="20" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onRecover([ad.id])}
                                disabled={isRecoverPending}
                                className="text-green-600 focus:text-green-600"
                            >
                                <Icon icon="solar:restart-bold" className="mr-2" width="16" />
                                Recover
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDestroy(ad.id)}
                                disabled={isDestroyPending}
                                className="text-red-600 focus:text-red-600"
                            >
                                <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
                                Delete Permanently
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
