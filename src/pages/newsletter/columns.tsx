import { type ColumnDef } from "@tanstack/react-table";
import { type Subscriber } from "@/services/newsletter";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
import { useState } from "react";

export const columns: ColumnDef<Subscriber>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                className="ml-2"
                checked={table.getIsAllPageRowsSelected()}
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
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => row.original.name || "N/A",
    },
    {
        accessorKey: "createdAt",
        header: "Subscribed At",
        cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const subscriber = row.original;
            const meta = table.options.meta as any;
            const [showDeleteAlert, setShowDeleteAlert] = useState(false);

            return (
                <div className="" onClick={(e) => e.stopPropagation()}>
                    <button
                        className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                                onClick={() => setShowDeleteAlert(true)}
                            >
                        <Icon
                            icon="ic:baseline-delete"
                            width="18"
                            height="18"
                            className="text-gray-500 hover:text-red-600 transition-colors"
                        />
                    </button>

                    <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the subscriber.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-red-500/90 hover:bg-red-500"
                                    onClick={() => meta?.onDelete([subscriber.id])}
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            );
        },
    },
];
