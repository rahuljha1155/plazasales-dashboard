import { useState } from "react";
import { useGetAllSellingPoints, useDeleteSellingPoint } from "@/hooks/useSellingPoint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Eye, Search } from "lucide-react";
import { Pagination } from "@/components/Pagination";
import { SellingPointCreateSheet } from "./SellingPointCreateSheet";
import { SellingPointEditSheet } from "./SellingPointEditSheet";
import { SellingPointViewModal } from "./SellingPointViewModal";
import type { ISellingPoint } from "@/types/ISellingPoint";

export function SellingPointList() {
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [search, setSearch] = useState("");
    const [selectedBrandId, setSelectedBrandId] = useState<string>("");
    const [editingPoint, setEditingPoint] = useState<ISellingPoint | null>(null);
    const [viewingPoint, setViewingPoint] = useState<ISellingPoint | null>(null);

    const { data, isLoading } = useGetAllSellingPoints(page, limit, search, selectedBrandId);
    const deletePoint = useDeleteSellingPoint();

    const sellingPoints = data?.data?.brandSellingPoints || [];
    const total = data?.data?.total || 0;
    const totalPages = data?.data?.totalPages || 1;

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this selling point?")) {
            await deletePoint.mutateAsync(id);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Selling Points</h2>
                <SellingPointCreateSheet />
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search selling points..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-8">Loading...</div>
            ) : (
                <>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Icon</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Subtitle</TableHead>
                                    <TableHead>Brand</TableHead>
                                    <TableHead>Sort Order</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sellingPoints.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                            No selling points found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sellingPoints.map((point) => (
                                        <TableRow key={point.id}>
                                            <TableCell>
                                                <img
                                                    src={point.icon}
                                                    alt={point.title}
                                                    className="w-10 h-10 object-cover rounded"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{point.title}</TableCell>
                                            <TableCell className="max-w-xs truncate">{point.subtitle}</TableCell>
                                            <TableCell>{point.brand?.name || "N/A"}</TableCell>
                                            <TableCell>{point.sortOrder}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => setViewingPoint(point)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setEditingPoint(point)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(point.id)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage} totalItems={0} itemsPerPage={0} />
                    )}
                </>
            )}

            {editingPoint && (
                <SellingPointEditSheet
                    sellingPoint={editingPoint}
                    open={!!editingPoint}
                    onClose={() => setEditingPoint(null)}
                />
            )}

            {viewingPoint && (
                <SellingPointViewModal
                    sellingPoint={viewingPoint}
                    open={!!viewingPoint}
                    onClose={() => setViewingPoint(null)}
                />
            )}
        </div>
    );
}
