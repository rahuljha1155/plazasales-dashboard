import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@iconify/react/dist/iconify.js";
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
import type { IFAQ } from "@/types/IFaq";

interface DeletedFaqTableColumnsProps {
    onRecover: (id: string) => void;
    onDestroyPermanently: (id: string) => void;
    isRecoverPending: boolean;
    isDestroyPending: boolean;
}

export const createDeletedFaqColumns = ({
    onRecover,
    onDestroyPermanently,
    isRecoverPending,
    isDestroyPending,
}: DeletedFaqTableColumnsProps): ColumnDef<IFAQ>[] => [
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
            accessorKey: "sno",
            header: () => (
                <div className="text-start font-semibold text-gray-700">No.</div>
            ),
            cell: ({ row }) => (
                <div className="font-medium text-gray-600">{row.index + 1}</div>
            ),
        },
        {
            accessorKey: "title",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="font-semibold text-gray-700 hover:text-gray-900"
                >
                    Title
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-medium line-clamp-1">{row.original.title}</div>
            ),
        },
        {
            id: "actions",
            header: () => <div className="font-semibold text-gray-700">Actions</div>,
            enableHiding: false,
            cell: ({ row }) => {
                const faq = row.original;

                return (
                    <div className="flex items-center gap-1">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-sm text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-600 transition-colors"
                                    disabled={isRecoverPending}
                                >
                                    <Icon icon="solar:refresh-bold" className="mr-1.5" width="16" />
                                    Recover
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-md">
                                <AlertDialogHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                            <Icon
                                                icon="solar:refresh-bold"
                                                className="text-green-600"
                                                width="24"
                                            />
                                        </div>
                                        <div>
                                            <AlertDialogTitle className="text-lg">
                                                Recover FAQ
                                            </AlertDialogTitle>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {faq.title}
                                            </p>
                                        </div>
                                    </div>
                                    <AlertDialogDescription className="text-gray-600">
                                        This will restore the FAQ and make it available again.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-lg">
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-green-500 hover:bg-green-600 rounded-lg"
                                        onClick={() => onRecover(faq.id)}
                                    >
                                        <Icon icon="solar:refresh-bold" className="mr-2" width="16" />
                                        Recover FAQ
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-sm text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-600 transition-colors"
                                    disabled={isDestroyPending}
                                >
                                    <Icon icon="solar:trash-bin-trash-bold" className="mr-1.5" width="16" />
                                    Delete Forever
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-md">
                                <AlertDialogHeader>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                            <Icon
                                                icon="solar:trash-bin-trash-bold"
                                                className="text-red-600"
                                                width="24"
                                            />
                                        </div>
                                        <div>
                                            <AlertDialogTitle className="text-lg">
                                                Delete FAQ Permanently
                                            </AlertDialogTitle>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {faq.title}
                                            </p>
                                        </div>
                                    </div>
                                    <AlertDialogDescription className="text-gray-600">
                                        <span className="font-semibold text-red-600">Warning:</span> This action cannot be undone. This will permanently delete the FAQ from the database.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="rounded-lg">
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-red-500 hover:bg-red-600 rounded-lg"
                                        onClick={() => onDestroyPermanently(faq.id)}
                                    >
                                        <Icon icon="solar:trash-bin-trash-bold" className="mr-2" width="16" />
                                        Delete Forever
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                );
            },
        },
    ];
