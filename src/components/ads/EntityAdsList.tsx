import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContextAds } from "@/hooks/useAds";
import { useDeleteAds } from "@/services/ads";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, Eye, MoreVertical, Plus, ArrowLeft, BarChart3 } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import AdAnalyticsModal from "./AdAnalyticsModal";

type EntityType = "product" | "brand" | "category" | "subcategory";

interface EntityAdsListProps {
    entityType: EntityType;
    entityId: string;
    entityName?: string;
}

export default function EntityAdsList({ entityType, entityId, entityName }: EntityAdsListProps) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [deleteIds, setDeleteIds] = useState<string[]>([]);
    const [selectedAds, setSelectedAds] = useState<string[]>([]);
    const [analyticsAdId, setAnalyticsAdId] = useState<string | null>(null);
    const [analyticsAdTitle, setAnalyticsAdTitle] = useState<string>("");

    const params = {
        productId: entityType === "product" ? entityId : undefined,
        brandId: entityType === "brand" ? entityId : undefined,
        categoryId: entityType === "category" ? entityId : undefined,
        subcategoryId: entityType === "subcategory" ? entityId : undefined,
    };

    const { data, isLoading } = useContextAds(params);
    const { mutateAsync: deleteAds, isPending: isDeleting } = useDeleteAds();

    const ads = Array.isArray(data?.data) ? data.data : [];

    const handleDelete = async () => {
        if (deleteIds.length === 0) return;

        try {
            await deleteAds(deleteIds.join(","));
            setDeleteIds([]);
            setSelectedAds([]);
            queryClient.invalidateQueries({ queryKey: ["getContextAds"] });
        } catch (error) {
        }
    };

    const handleSelectAd = (adId: string) => {
        setSelectedAds((prev) =>
            prev.includes(adId) ? prev.filter((id) => id !== adId) : [...prev, adId]
        );
    };

    const handleSelectAll = () => {
        if (selectedAds.length === ads.length) {
            setSelectedAds([]);
        } else {
            setSelectedAds(ads.map((ad) => ad.id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedAds.length > 0) {
            setDeleteIds(selectedAds);
        }
    };

    const getEntityLabel = () => {
        const labels = {
            product: "Product",
            brand: "Brand",
            category: "Category",
            subcategory: "Subcategory",
        };
        return labels[entityType];
    };

    return (
        <div className="space-y-6">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            <Card className="p-0">
                <CardHeader className="flex flex-row items-center justify-between p-2">
                    <div>
                        <CardTitle>
                            {getEntityLabel()} Advertisements
                            {entityName && <span className="text-muted-foreground"> - {entityName}</span>}
                        </CardTitle>
                        <CardDescription>
                            Manage ads for this {getEntityLabel().toLowerCase()}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        {selectedAds.length > 0 && (
                            <Button
                                variant="destructive"
                                onClick={handleBulkDelete}
                                className="rounded-xs"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                delete ({selectedAds.length})
                            </Button>
                        )}


                        <Button
                            onClick={() =>
                                navigate(
                                    `/dashboard/ads/create?${entityType}Id=${entityId}`
                                )
                            }
                            className="rounded-xs"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Ad
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-2">
                    {isLoading ? (
                        <div className="space-y-1">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xs border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedAds.length === ads.length && ads.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead className="w-12">S.N</TableHead>
                                        <TableHead>Banner</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Start Date</TableHead>
                                        <TableHead>End Date</TableHead>
                                        <TableHead>Sort Order</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ads && ads.length > 0 ? (
                                        ads.map((ad, idx) => (
                                            <TableRow key={ad.id}>
                                                <TableCell className="w-12">
                                                    <Checkbox
                                                        checked={selectedAds.includes(ad.id)}
                                                        onCheckedChange={() => handleSelectAd(ad.id)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium w-12">
                                                    {idx + 1}
                                                </TableCell>
                                                <TableCell>
                                                    {ad.bannerUrls && ad.bannerUrls.length > 0 ? (
                                                        <img
                                                            src={ad.bannerUrls[0]}
                                                            alt={ad.title}
                                                            className="w-20 h-12 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                                            No image
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{ad.title}</TableCell>
                                                <TableCell>
                                                    <span>
                                                        {ad.isActive ? "Active" : "Inactive"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {ad.startAt
                                                        ? format(new Date(ad.startAt), "MMM dd, yyyy")
                                                        : "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {ad.endAt
                                                        ? format(new Date(ad.endAt), "MMM dd, yyyy")
                                                        : "-"}
                                                </TableCell>
                                                <TableCell>{ad.sortOrder}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="w-4 rotate-90 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    navigate(`/dashboard/ads/view/${ad.id}`)
                                                                }
                                                            >
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setAnalyticsAdId(ad.id);
                                                                    setAnalyticsAdTitle(ad.title);
                                                                }}
                                                            >
                                                                <BarChart3 className="w-4 h-4 mr-2" />
                                                                Analytics
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    navigate(`/dashboard/ads/edit/${ad.id}`)
                                                                }
                                                            >
                                                                <Pencil className="w-4 h-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => setDeleteIds([ad.id])}
                                                                className="text-red-600 focus:text-red-600"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center py-8">
                                                No ads found for this {getEntityLabel().toLowerCase()}.
                                                Create your first advertisement!
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteIds.length > 0} onOpenChange={() => setDeleteIds([])}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will move {deleteIds.length} ad(s) to trash. You can recover
                            them later from the deleted ads section.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {analyticsAdId && (
                <AdAnalyticsModal
                    adId={analyticsAdId}
                    adTitle={analyticsAdTitle}
                    open={!!analyticsAdId}
                    onOpenChange={(open) => {
                        if (!open) {
                            setAnalyticsAdId(null);
                            setAnalyticsAdTitle("");
                        }
                    }}
                />
            )}
        </div>
    );
}
