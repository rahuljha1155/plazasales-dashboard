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
import { Icon } from "@iconify/react/dist/iconify.js";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import { api2 } from "@/services/api";
import { toast } from "sonner";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";

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
            const { getRecaptchaToken } = useRecaptcha();
            const queryClient = useQueryClient();

            const handleToggle = async (checked: boolean) => {
                try {
                    const recaptchaToken = await getRecaptchaToken('toggle_active');
                    
                    if (!recaptchaToken) {
                        toast.error("Failed to verify reCAPTCHA");
                        return;
                    }

                    await api2.put(
                        `/shareable/update-shareable/${sharable.id}`,
                        { isActive: checked },
                        {
                            headers: {
                                'X-Recaptcha-Token': recaptchaToken
                            }
                        }
                    );
                    
                    toast.success("Sharable status updated successfully");
                    queryClient.invalidateQueries({ queryKey: ["getSharables"] });
                } catch (error: any) {
                    toast.error(error?.response?.data?.message || "Failed to update sharable status");
                }
            };

            return (
                <Switch
                    checked={sharable.isActive}
                    onCheckedChange={handleToggle}
                />
            );
        },
    },

    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const sharable = row.original;
            const { user } = useUserStore();
            const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors">
                            <MoreVertical className="w-4 rotate-90 h-4 text-gray-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>More Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onView(sharable)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(sharable)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit Details
                        </DropdownMenuItem>
                        {isSudoAdmin && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => {
                                        // Navigate to SEO optimization page for this sharable
                                        window.location.href = `/dashboard/sharables/${sharable.id}/seo`;
                                    }}
                                >
                                    <Icon icon="solar:magnifer-bold" className="w-4 h-4 mr-2 text-gray-500" />
                                    SEO Optimization
                                </DropdownMenuItem>
                            </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onDelete(sharable.id)}
                            className="text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Sharable
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
