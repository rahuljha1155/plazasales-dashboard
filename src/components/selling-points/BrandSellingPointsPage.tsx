import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetAllSellingPoints, useDeleteSellingPoint, useUpdateSellingPointSortOrder } from "@/hooks/useSellingPoint";
import { useGetBrandById } from "@/services/brand";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
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
import { MoreHorizontal, Pencil, Trash2, Eye, Search, Plus } from "lucide-react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { SellingPointViewModal } from "./SellingPointViewModal";
import { SortableSellingPointRow } from "./SortableSellingPointRow";
import type { ISellingPoint } from "@/types/ISellingPoint";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { TableShimmer } from "@/components/table-shimmer";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export function BrandSellingPointsPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [search, setSearch] = useState("");
  const [viewingPoint, setViewingPoint] = useState<ISellingPoint | null>(null);
  const [deletingPoint, setDeletingPoint] = useState<ISellingPoint | null>(null);
  const [sortedPoints, setSortedPoints] = useState<ISellingPoint[]>([]);

  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

  const { data: brandData, isLoading: isBrandLoading } = useGetBrandById(brandId || "");
  const { data, isLoading } = useGetAllSellingPoints();
  const deletePoint = useDeleteSellingPoint();
  const { mutateAsync: updateSortOrder } = useUpdateSellingPointSortOrder();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const brand = brandData?.brand;
  const sellingPoints = data?.data?.brandSellingPoints || [];

  // Filter by current brand and sort by sortOrder
  useEffect(() => {
    // Filter by brand and sort by sortOrder
    const brandPoints = sellingPoints
      .filter((point) => point.brand?.id === brandId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    
    setSortedPoints(brandPoints);
  }, [sellingPoints, brandId]);

  const filteredPoints = sortedPoints.filter((point) =>
    point.title.toLowerCase().includes(search.toLowerCase()) ||
    point.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    await deletePoint.mutateAsync(id);
    setDeletingPoint(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortedPoints.findIndex((point) => point.id === active.id);
    const newIndex = sortedPoints.findIndex((point) => point.id === over.id);

    const newPoints = arrayMove(sortedPoints, oldIndex, newIndex);
    
    // Update sortOrder for all items
    const updatedPoints = newPoints.map((point, index) => ({
      ...point,
      sortOrder: index,
    }));
    
    // Optimistically update UI
    setSortedPoints(updatedPoints);

    try {
      // Update all items with their new sort orders
      for (let i = 0; i < updatedPoints.length; i++) {
        const point = updatedPoints[i];
        const originalPoint = sortedPoints.find(p => p.id === point.id);
        
        // Only update if sort order actually changed
        if (originalPoint && originalPoint.sortOrder !== point.sortOrder) {
          await updateSortOrder({
            id: point.id,
            sortOrder: point.sortOrder,
          });
        }
      }
      
      toast.success("Selling point order updated successfully");
    } catch (error: any) {
      // Revert on error
      setSortedPoints(sortedPoints);
      toast.error(error?.response?.data?.message || "Failed to update order");
    }
  };

  const breadcrumbLinks = [
    {
      label: "Brands",
      href: "/dashboard/brands",
      handleClick: () => navigate("/dashboard/brands"),
    },
    {
      label: brand?.name || "Brand",
      href: `/dashboard/brands/view/${brand?.slug}`,
      handleClick: () => navigate(`/dashboard/brands/view/${brand?.slug}`),
    },
    {
      label: "Selling Points",
      isActive: true,
      handleClick: () => {},
    },
  ];

  if (isBrandLoading) {
    return <TableShimmer />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Breadcrumb links={breadcrumbLinks} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {brand?.logoUrl && (
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="h-12 w-12 object-contain rounded border"
            />
          )}
          <h2 className="text-2xl font-bold whitespace-nowrap">{brand?.name} - Selling Points</h2>
        </div>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search selling points..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>
          {isSudoAdmin && (
            <Button
              variant="destructive"
              onClick={() => navigate(`/dashboard/brands/${brandId}/selling-points/deleted`)}
            >
              <Icon icon="solar:trash-bin-minimalistic-bold" className="mr-2" width="20" />
              View Deleted
            </Button>
          )}
          <Button onClick={() => navigate(`/dashboard/brands/${brandId}/selling-points/create`)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Selling Point
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Subtitle</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <SortableContext
                items={filteredPoints.map((point) => point.id)}
                strategy={verticalListSortingStrategy}
              >
                <TableBody>
                  {filteredPoints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No selling points found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPoints.map((point) => (
                      <SortableSellingPointRow key={point.id} id={point.id}>
                        <TableCell>
                          <img
                            src={point.icon}
                            alt={point.title}
                            className="w-10 h-10 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{point.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{point.subtitle}</TableCell>
                        <TableCell className="text-right pr-6">
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
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/dashboard/brands/${brandId}/selling-points/edit/${point.id}`)
                                }
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeletingPoint(point)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </SortableSellingPointRow>
                    ))
                  )}
                </TableBody>
              </SortableContext>
            </Table>
          </DndContext>
        </div>
      )}

      {viewingPoint && (
        <SellingPointViewModal
          sellingPoint={viewingPoint}
          open={!!viewingPoint}
          onClose={() => setViewingPoint(null)}
        />
      )}

      <AlertDialog open={!!deletingPoint} onOpenChange={() => setDeletingPoint(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selling Point</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPoint?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPoint && handleDelete(deletingPoint.id)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
