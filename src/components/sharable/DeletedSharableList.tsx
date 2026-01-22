import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api2 } from "@/services/api";
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
import { Trash2, MoreVertical, ArrowLeft, RotateCcw } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";

interface ISharable {
    id: string;
    productId: string;
    kind: string;
    title: string;
    fileType: string;
    isActive: boolean;
    sortOrder: number;
    extra: string;
    mediaAsset: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
}

export default function DeletedSharableList() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { productId } = useParams<{ productId: string }>();
    const [destroyIds, setDestroyIds] = useState<string[]>([]);
    const [recoverIds, setRecoverIds] = useState<string[]>([]);
    const [selectedSharables, setSelectedSharables] = useState<string[]>([]);

    const { data, isLoading } = useQuery({
        queryKey: ["getDeletedSharables", productId],
        queryFn: async () => {
            const url = productId 
                ? `/shareable/deleted-shareables?productId=${productId}`
                : `/shareable/deleted-shareables`;
            const res = await api2.get<{ 
                status: number; 
                message: string;
                data: {
                    shareables: ISharable[];
                    total: number;
                    page: number;
                    limit: number;
                    totalPages: number;
                }
            }>(url);
            return res.data.data;
        },
    });

    const sharables = Array.isArray(data?.shareables) ? data.shareables : [];

    const handleDestroy = async () => {
        if (destroyIds.length === 0) return;

        try {
            await api2.delete(`/shareable/destroy-shareables/${destroyIds.join(",")}`);
            toast.success("Sharable permanently deleted");
            setDestroyIds([]);
            setSelectedSharables([]);
            queryClient.invalidateQueries({ queryKey: ["getDeletedSharables", productId] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to destroy sharable");
        }
    };

    const handleRecover = async () => {
        if (recoverIds.length === 0) return;

        try {
            await api2.put(`/shareable/recover-shareables`, { ids: recoverIds });
            toast.success("Sharable recovered successfully");
            setRecoverIds([]);
            setSelectedSharables([]);
            queryClient.invalidateQueries({ queryKey: ["getDeletedSharables", productId] });
            queryClient.invalidateQueries({ queryKey: ["getSharables", productId] });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to recover sharable");
        }
    };

    const handleSelectSharable = (sharableId: string) => {
        setSelectedSharables((prev) =>
            prev.includes(sharableId) ? prev.filter((id) => id !== sharableId) : [...prev, sharableId]
        );
    };

    const handleSelectAll = () => {
        if (selectedSharables.length === sharables.length) {
            setSelectedSharables([]);
        } else {
            setSelectedSharables(sharables.map((s) => s.id));
        }
    };

    const handleBulkDestroy = () => {
        if (selectedSharables.length > 0) {
            setDestroyIds(selectedSharables);
        }
    };

    const handleBulkRecover = () => {
        if (selectedSharables.length > 0) {
            setRecoverIds(selectedSharables);
        }
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
                        <CardTitle>Deleted Sharables</CardTitle>
                        <CardDescription>
                            Recover or permanently delete sharables
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        {selectedSharables.length > 0 && (
                            <>
                                <Button
                                    variant="default"
                                    onClick={handleBulkRecover}
                                    className="rounded-xs"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Recover ({selectedSharables.length})
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleBulkDestroy}
                                    className="rounded-xs"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Destroy ({selectedSharables.length})
                                </Button>
                            </>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-2">
                    {isLoading ? (
                        <div className="rounded-xs border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <div className="h-4 w-4 bg-gray-200 animate-pulse rounded" />
                                        </TableHead>
                                        <TableHead className="w-12">S.N</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Kind</TableHead>
                                        <TableHead>File Type</TableHead>
                                        <TableHead>Deleted At</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="w-12">
                                                <div className="h-4 w-4 bg-gray-200 animate-pulse rounded" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 w-8 bg-gray-200 animate-pulse rounded" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                                            </TableCell>
                                            <TableCell>
                                                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
                                                    <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="rounded-xs border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedSharables.length === sharables.length && sharables.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead className="w-12">S.N</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Kind</TableHead>
                                        <TableHead>File Type</TableHead>
                                        <TableHead>Deleted At</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sharables && sharables.length > 0 ? (
                                        sharables.map((sharable, idx) => (
                                            <TableRow key={sharable.id}>
                                                <TableCell className="w-12">
                                                    <Checkbox
                                                        checked={selectedSharables.includes(sharable.id)}
                                                        onCheckedChange={() => handleSelectSharable(sharable.id)}
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium w-12">
                                                    {idx + 1}
                                                </TableCell>
                                                <TableCell className="font-medium">{sharable.title}</TableCell>
                                                <TableCell>{sharable.kind}</TableCell>
                                                <TableCell>{sharable.fileType}</TableCell>
                                                <TableCell>
                                                    {sharable.deletedAt 
                                                        ? new Date(sharable.deletedAt).toLocaleDateString()
                                                        : 'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setRecoverIds([sharable.id])}
                                                        >
                                                            <RotateCcw className="w-4 h-4 mr-2" />
                                                            Recover
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => setDestroyIds([sharable.id])}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                No deleted sharables found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Destroy Confirmation Dialog */}
            <AlertDialog open={destroyIds.length > 0} onOpenChange={() => setDestroyIds([])}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Permanently Delete?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {destroyIds.length} sharable(s) from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDestroy}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Destroy Permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Recover Confirmation Dialog */}
            <AlertDialog open={recoverIds.length > 0} onOpenChange={() => setRecoverIds([])}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Recover Sharables?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will restore {recoverIds.length} sharable(s) back to the active list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRecover}>
                            Recover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
