import { type ColumnDef } from "@tanstack/react-table";
import { type Subscriber } from "@/services/newsletter";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";


export const deletedColumns: ColumnDef<Subscriber>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
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
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => row.original.name || "N/A",
    },
    {
        accessorKey: "updatedAt",
        header: "Deleted At",
        cell: ({ row }) => row.original.updatedAt ? new Date(row.original.updatedAt).toLocaleDateString() : "N/A",
    },
    {
        id: "actions",
        header: () => <div className="text-end pr-6">Actions</div>,
        cell: ({ row, table }) => {
            const subscriber = row.original;
            const meta = table.options.meta as any;

            return (
                <div className="flex gap-2 justify-end">
                    <Button onClick={() => meta?.onRecover([subscriber.id])} variant={"outline"} className="flex text-green-500 hover:bg-green-500 hover:text-white gap-3 items-center ">Recover  <Icon
                        icon="solar:refresh-bold"
                        className=" size-4"
                        width="24"
                    /></Button>

                    <Button onClick={() => meta?.onDestroy([subscriber.id])} variant={"outline"} className="flex text-red-500 hover:bg-red-500 hover:text-white gap-3 items-center ">Delete  <Icon
                        icon="solar:trash-bin-minimalistic-bold"
                        className=" size-4"
                        width="24"
                    /></Button>


                </div>
            );
        },
    },
];
