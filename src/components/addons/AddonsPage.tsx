import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { ArrowLeft, Plus, Eye, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { DataTable } from "../ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { api } from "@/services/api";
import Breadcrumb from "../dashboard/Breadcumb";
import AddonsModal from "./AddonsModal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../ui/alert-dialog";
import { Icon } from "@iconify/react/dist/iconify.js";

export default function AddonsPage() {
    const [searchParams] = useSearchParams();
    const { id: packageId } = useParams();
    const [addons, setAddons] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingAddon, setEditingAddon] = useState<any | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [addonToDelete, setAddonToDelete] = useState<any | null>(null);

    // Fetch addons for the package
    const fetchAddons = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/addons/package/${packageId}`);
            setAddons(response.data.data || []);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch addons");
        } finally {
            setIsLoading(false);
        }
    };

    // Load initial data
    useEffect(() => {
        if (packageId) {
            fetchAddons();
        }
    }, [packageId]);

    // Delete addon
    const deleteAddon = async (id: string) => {
        try {
            await api.delete(`/addons/${id}`);
            toast.success("Addon deleted successfully");
            fetchAddons();
            setShowDeleteDialog(false);
            setAddonToDelete(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete addon");
        }
    };

    // Handle delete confirmation
    const handleDeleteClick = (addon: any) => {
        setAddonToDelete(addon);
        setShowDeleteDialog(true);
    };

    // Edit addon
    const editAddon = (addon: any) => {
        setEditingAddon(addon);
        setShowModal(true);
    };

    // Handle modal success
    const handleModalSuccess = () => {
        fetchAddons();
        setShowModal(false);
        setEditingAddon(null);
    };

    // Handle modal close
    const handleModalClose = () => {
        setShowModal(false);
        setEditingAddon(null);
    };

    // Table columns
    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "image",
            header: "Image",
            cell: ({ row }) => {
                const imageUrl = row.getValue("image") as string;
                return imageUrl ? (
                    <div className="w-16 h-16 overflow-hidden rounded-sm border border-gray-200">
                        <img
                            src={imageUrl}
                            alt={row.getValue("name") as string}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-200"
                        />
                    </div>
                ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center border border-gray-200">
                        <Eye className="w-6 h-6 text-gray-400" />
                    </div>
                );
            },
        },
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => {
                const description = row.getValue("description") as string;
                // Strip HTML tags for display in table
                const plainText = description.replace(/<[^>]*>/g, '');
                return (
                    <div className="max-w-xs truncate" title={plainText}>
                        {plainText}
                    </div>
                );
            },
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => <div>${row.getValue("price")}</div>,
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="flex ">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editAddon(row.original)}
                    >
                        <Icon
                            icon="mynaui:edit-one"
                            width="16"
                            height="16"
                            className="text-zinc-400 hover:text-primary"
                        />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(row.original)}
                    >
                        <Icon
                            icon="ic:baseline-delete"
                            width="16"
                            height="16"
                            className="text-zinc-400 hover:text-red-500"
                        />
                    </Button>
                </div>
            ),
        },
    ];

    // Breadcrumb links
    const links = [
        { to: "/dashboard", label: "Dashboard" },
        { to: "/dashboard/packages", label: "Packages" },
        {
            to: `/dashboard/addons/${packageId}`,
            label: searchParams.get("package") || "Package",
            isActive: true,
        },
    ];

    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <Link to={-1 as any} className="inline-flex items-center mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Package
                </Link>
                <Breadcrumb links={links} />
            </div>

            <div className="bg-white p-6 rounded-sm shadow">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Package Addons</h2>
                    <Button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Addon
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        <span className="ml-2 text-gray-600">Loading addons...</span>
                    </div>
                ) : (
                    <DataTable
                        data={addons}
                        columns={columns}
                        filterColumn="name"
                        filterPlaceholder="Search addons..."
                        pagination={{
                            showPageInfo: true,
                            showItemsPerPage: true,
                            itemsPerPage: 10,
                            totalItems: addons.length,
                            currentPage: 1,
                            totalPages: Math.ceil(addons.length / 10),
                            onPageChange: () => { },
                            onItemsPerPageChange: () => { },
                        }}
                    />
                )}
            </div>

            {/* Addons Modal */}
            <AddonsModal
                open={showModal}
                onOpenChange={setShowModal}
                onSuccess={handleModalSuccess}
                packageId={packageId || ""}
                editData={editingAddon}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Addon</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{addonToDelete?.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => addonToDelete && deleteAddon(addonToDelete._id)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
