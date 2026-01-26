import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CaretSortIcon } from "@radix-ui/react-icons";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProductDownload } from "@/types/IDownload";
import { Download as DownloadIcon, MoreVertical, Pencil, Trash2, Eye } from "lucide-react";

interface ProductDownloadTableColumnsProps {
    onEdit: (download: ProductDownload) => void;
    onView: (download: ProductDownload) => void;
    onDelete: (id: string) => void;
    onDownloadFile: (id: string) => void;
    isDeletePending: boolean;
}

export const createProductDownloadColumns = ({
    onEdit,
    onView,
    onDelete,
    onDownloadFile,
    isDeletePending,
}: ProductDownloadTableColumnsProps): ColumnDef<ProductDownload>[] => [
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
            accessorKey: "sortOrder",
            header: () => (
                <div className="text-start font-semibold text-gray-700">S.N</div>
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
                    className="font-semibold text-gray-700 hover:text-gray-900 px-0"
                >
                    Title
                    <CaretSortIcon className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="cursor-pointer">
                    <p className="font-medium ">{row.original.title}</p>
                    <p className="text-xs text-gray-500 uppercase">
                        {row.original.fileType}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: "version",
            header: () => (
                <div className="font-semibold text-gray-700">Version</div>
            ),
            cell: ({ row }) => (
                <div className="text-sm text-gray-600">{row.original.version}</div>
            ),
        },
        {
            accessorKey: "sizeBytes",
            header: () => (
                <div className="font-semibold text-gray-700">Size</div>
            ),
            cell: ({ row }) => {
                const bytes = row.original.sizeBytes;
                if (bytes === 0) return "0 Bytes";
                const k = 1024;
                const sizes = ["Bytes", "KB", "MB", "GB"];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
            },
        },
        {
            accessorKey: "releasedOn",
            header: () => (
                <div className="font-semibold text-gray-700">Released</div>
            ),
            cell: ({ row }) => (
                <div className="text-sm text-gray-600">
                    {new Date(row.original.releasedOn as string).toLocaleDateString()}
                </div>
            ),
        },
        {
            accessorKey: "platforms",
            header: () => (
                <div className="font-semibold text-gray-700">Platforms</div>
            ),
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.platforms.slice(0, 2).map((platform, idx) => (
                        <span key={platform} className="text-xs capitalize">
                            {platform}{idx < Math.min(row.original.platforms.length, 2) - 1 ? "," : ""}
                        </span>
                    ))}
                    {row.original.platforms.length > 2 && (
                        <span className="text-xs">
                            +{row.original.platforms.length - 2}
                        </span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "isActive",
            header: () => (
                <div className="font-semibold text-gray-700">Status</div>
            ),
            cell: ({ row }) => (
                <div className="flex gap-1">
                    {row.original.isActive ? (
                        <span className="items-center flex gap-2 text-xs">
                            <Icon icon={"garden:check-badge-fill-12"} className="size-5 text-green-500 mr-1" />
                        </span>
                    ) : (
                        <span className="items-center flex gap-2 text-xs">
                            <Icon icon={"garden:check-badge-fill-12"} className="size-5 text-zinc-500 mr-1" />
                        </span>
                    )}
                </div>
            ),
        },
        {
            id: "actions",
            header: () => <div className="font-semibold text-gray-700 text-right">Actions</div>,
            enableHiding: false,
            cell: ({ row }) => {
                const download = row.original;

                return (
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                                >
                                    <MoreVertical className="w-4 rotate-90 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    onClick={() => onDownloadFile(download.id)}
                                >
                                    <DownloadIcon className="w-4 h-4 mr-2" />
                                    Download File
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    className="flex gap-2 items-center"
                                    onClick={() => onView(download)}
                                >
                                    <Eye className="w-4 h-4 mr-2 text-gray-500" />
                                    View Details
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    className="flex gap-2 items-center"
                                    onClick={() => onEdit(download)}
                                >
                                    <Pencil className="w-4 h-4 mr-2 text-gray-500" />
                                    Edit Details
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <div className="flex cursor-pointer select-none items-center px-2 py-1.5 text-sm text-red-600 hover:bg-accent rounded-sm">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Download
                                        </div>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="max-w-md">
                                        <AlertDialogHeader>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                                    <Icon
                                                        icon="solar:danger-bold"
                                                        className="text-red-600"
                                                        width="24"
                                                    />
                                                </div>
                                                <div>
                                                    <AlertDialogTitle className="text-lg">
                                                        Delete Product Download
                                                    </AlertDialogTitle>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {download.title}
                                                    </p>
                                                </div>
                                            </div>
                                            <AlertDialogDescription className="text-gray-600">
                                                This action cannot be undone. This will delete the
                                                product download metadata from the system.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-lg">
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-red-500 hover:bg-red-600 rounded-lg"
                                                onClick={() => onDelete(download.id)}
                                                disabled={isDeletePending}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Download
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];
