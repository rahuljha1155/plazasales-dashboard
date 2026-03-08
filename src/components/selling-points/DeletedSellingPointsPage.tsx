import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetDeletedSellingPoints,
  useRecoverSellingPoints,
  useDestroySellingPoints,
} from "@/hooks/useSellingPoint";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Search, RotateCcw, Trash2 } from "lucide-react";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { TableShimmer } from "@/components/table-shimmer";
import { toast } from "sonner";
import type { ISellingPoint } from "@/types/ISellingPoint";

export function DeletedSellingPointsPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [recoveringId, setRecoveringId] = useState<string | null>(null);
  const [destroyingId, setDestroyingId] = useState<string | null>(null);

  const isSudoAdmin = user?.role === UserRole.SUDOADMIN;

  const { data: brandData, isLoading: isBrandLoading } = useGetBrandById(brandId || "");
  const { data, isLoading } = useGetDeletedSellingPoints(page, limit);
  const { mutateAsync: recoverPoints } = useRecoverSellingPoints();
  const { mutateAsync: destroyPoints } = useDestroySellingPoints();

  const brand = brandData?.brand;
  const allDeletedPoints = data?.data?.brandSellingPoints || [];
  
  // Filter by current brand and search
  const deletedPoints = allDeletedPoints.filter((point) => {
    const matchesBrand = point.brand?.id === brandId;
    const matchesSearch = search
      ? point.title.toLowerCase().includes(search.toLowerCase()) ||
        point.subtitle.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesBrand && matchesSearch;
  });

  // Redirect if not sudo admin
  if (!isSudoAdmin) {
    navigate("/dashboard/brands");
    return null;
  }

  const handleRecover = async (id: string) => {
    try {
      await recoverPoints({ ids: [id] });
      setRecoveringId(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to recover selling point");
    }
  };

  const handleDestroy = async (id: string) => {
    try {
      await destroyPoints(id);
      setDestroyingId(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to permanently delete selling point");
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
      href: `/dashboard/brands/${brandId}/selling-points`,
      handleClick: () => navigate(`/dashboard/brands/${brandId}/selling-points`),
    },
    {
      label: "Deleted",
      isActive: true,
      handleClick: () => {},
    },
  ];

  if (isBrandLoading) {
    return <TableShimmer />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb links={breadcrumbLinks} />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {brand?.logoUrl && (
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="h-12 w-12 object-contain rounded border"
            />
          )}
          <h2 className="text-2xl font-bold whitespace-nowrap">{brand?.name} - Deleted Selling Points</h2>
        </div>
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search deleted selling points..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-full"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(`/dashboard/brands/${brandId}/selling-points`)}
          >
            <Icon icon="solar:arrow-left-linear" className="mr-2" width="20" />
            Back to Selling Points
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead>Sort Order</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deletedPoints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No deleted selling points found
                  </TableCell>
                </TableRow>
              ) : (
                deletedPoints.map((point) => (
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
                    <TableCell>{point.sortOrder}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRecoveringId(point.id)}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Recover
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDestroyingId(point.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Forever
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Recover Confirmation Dialog */}
      <AlertDialog open={!!recoveringId} onOpenChange={() => setRecoveringId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Recover Selling Point</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to recover this selling point? It will be restored to the active list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => recoveringId && handleRecover(recoveringId)}
              className="bg-green-500 hover:bg-green-600"
            >
              Recover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Destroy Confirmation Dialog */}
      <AlertDialog open={!!destroyingId} onOpenChange={() => setDestroyingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Selling Point</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this selling point? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => destroyingId && handleDestroy(destroyingId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
