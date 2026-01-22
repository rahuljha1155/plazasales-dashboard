import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAds } from "@/hooks/useAds";
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
import { Pencil, Trash2, Eye, MoreVertical, Plus, BarChart3 } from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Pagination } from "@/components/Pagination";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import AdAnalyticsModal from "./AdAnalyticsModal";
import Breadcrumb from "../dashboard/Breadcumb";

export default function AdsList() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useUserStore();
    const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

    const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
    const [page, setPage] = useState(pageFromUrl);
    const [limit] = useState(10);
    const [deleteIds, setDeleteIds] = useState<string[]>([]);
    const [selectedAds, setSelectedAds] = useState<string[]>([]);
    const [analyticsAdId, setAnalyticsAdId] = useState<string | null>(null);
    const [analyticsAdTitle, setAnalyticsAdTitle] = useState<string>("");

    const { ads, total, totalPages, isLoading, deleteAds, isDeleting } = useAds({
        page,
        limit,
    });

    useEffect(() => {
        const urlPage = parseInt(searchParams.get("page") || "1", 10);
        if (urlPage !== page) {
            setPage(urlPage);
        }
    }, [searchParams]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        setSearchParams({ page: newPage.toString() });
    };

    const handleDelete = async () => {
        if (deleteIds.length === 0) return;

        try {
            await deleteAds(deleteIds.join(","));
            setDeleteIds([]);
            setSelectedAds([]);
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

    return (
        <div className="space-y-6">
            <Card className="p-0">
                <CardHeader className="flex flex-row items-center justify-between p-2">
                    <div>
                        <Breadcrumb links={[{ label: "Advertisement", href: "#" }, { label: "View All", isActive: true }]} />
                    </div>
                    <div className="flex gap-2">
                        {selectedAds.length > 0 && (
                            <Button
                                variant="destructive"
                                onClick={handleBulkDelete}
                                className="rounded-xs text-white"

                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                delete ({selectedAds.length})
                            </Button>
                        )}
                        {isSudoAdmin && (
                            <Button
                                variant="destructive"
                                onClick={() => navigate("/dashboard/ads/deleted")}
                            >
                                <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4 mr-2" />
                                View Deleted
                            </Button>
                        )}

                        <Button
                            className="rounded-sm hover:shadow-md transition-shadow"
                            onClick={() => navigate("/dashboard/ads/create")}
                        >
                            <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
                            New Ad
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-2">
                    {isLoading ? (
                        <div className="space-y-1">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="rounded-xs border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <Checkbox
                                                    className="ml-3"
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
                                            <TableHead className="text-center pr-4">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ads && ads.length > 0 ? (
                                            ads.map((ad, idx) => (
                                                <TableRow className="cursor-pointer" onClick={() => navigate(`/dashboard/ads/view/${ad.id}`)} key={ad.id}>
                                                    <TableCell className="w-12">
                                                        <Checkbox
                                                            className="ml-3"
                                                            checked={selectedAds.includes(ad.id)}
                                                            onCheckedChange={() => handleSelectAd(ad.id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="font-medium w-12">
                                                        {(page - 1) * limit + idx + 1}
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
                                                        <span >
                                                            {ad.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {ad.startAt ? format(new Date(ad.startAt), "MMM dd, yyyy") : "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {ad.endAt ? format(new Date(ad.endAt), "MMM dd, yyyy") : "-"}
                                                    </TableCell>
                                                    <TableCell>{ad.sortOrder}</TableCell>
                                                    <TableCell className="text-center pr-4">
                                                        <DropdownMenu >
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreVertical className="w-4 rotate-90 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => navigate(`/dashboard/ads/view/${ad.id}`)}
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
                                                                    onClick={() => navigate(`/dashboard/ads/edit/${ad.id}`)}
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
                                                    No ads found. Create your first advertisement!
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {totalPages > 0 && (
                                <div className="mt-4">
                                    <Pagination
                                        currentPage={page}
                                        totalPages={totalPages}
                                        totalItems={total}
                                        itemsPerPage={limit}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteIds.length > 0} onOpenChange={() => setDeleteIds([])}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will move {deleteIds.length} ad(s) to trash. You can recover them later
                            from the deleted ads section.
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
