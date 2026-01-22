import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  useGetVideosByProductId,
  useDeleteVideo,
} from "@/hooks/useVideo";
import {
  Card,
  CardContent,
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
  Trash2,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { VideoCreateModal } from "./VideoCreateModal";
import { VideoEditPage } from "./VideoEditPage";
import { VideoViewPage } from "./VideoViewPage";
import type { Video } from "@/hooks/useVideo";
import { useSelectedDataStore } from "@/store/selectedStore";
import Breadcrumb from "../dashboard/Breadcumb";
import { useUserStore } from "@/store/userStore";
import { UserRole } from "@/components/LoginPage";
import { DataTable } from "@/components/ui/data-table";
import { createVideoColumns } from "./VideoTableColumns";

interface VideoListProps {
  productId?: string;
}

type ViewMode = "list" | "view" | "edit";

export default function VideoList({ productId: propProductId }: VideoListProps) {
  const { id } = useParams<{ id: string }>();
  const productId = propProductId || id;
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { selectedBrand, selectedCategory, selectedSubcategory, selectedProduct } = useSelectedDataStore();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, error } = useGetVideosByProductId(productId || "");
  const deleteMutation = useDeleteVideo();
  const [selectedRows, setSelectedRows] = useState<Video[]>([]);


  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Video deleted successfully");
      setDeleteId(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete video");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    try {
      const ids = selectedRows.map(video => video.id).join(",");
      await deleteMutation.mutateAsync(ids);
      toast.success("Selected videos deleted successfully");
      setSelectedRows([]);
    } catch (e) {
      toast.error("Failed to delete videos");
    }
  }


  const handleView = (video: Video) => {
    setSelectedVideo(video);
    setViewMode("view");
  };

  const handleEdit = (video: Video) => {
    setSelectedVideo(video);
    setViewMode("edit");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedVideo(null);
  };


  const breadcrumbLinks = [
    { label: selectedBrand?.name || "Brands", href: "/dashboard/brands" },
    { label: selectedCategory?.title || "Product Types", href: `/dashboard/category/${selectedBrand?.slug || ""}` },
    { label: selectedSubcategory?.title || "Categories", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}` },
    { label: selectedProduct?.name || "Products", href: `/dashboard/category/${selectedBrand?.slug || ""}/subcategory/${selectedCategory?.slug || ""}/products/${selectedSubcategory?.slug || selectedSubcategory?.original?.slug || ""}` },
    { label: "Video List", isActive: true },
  ];

  const columns = createVideoColumns({
    onEdit: handleEdit,
    onView: handleView,
    onDelete: (id) => setDeleteId(id),
  });

  const tableData = data?.videos || [];


  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">
              Error loading videos: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show view page
  if (viewMode === "view" && selectedVideo) {
    return <VideoViewPage video={selectedVideo} onBack={handleBackToList} />;
  }

  // Show edit page
  if (viewMode === "edit" && selectedVideo) {
    return (
      <VideoEditPage
        video={selectedVideo}
        productId={productId as string}
        onSuccess={handleBackToList}
        onCancel={handleBackToList}
      />
    );
  }

  return (
    <div className=" space-y-6">
      <Breadcrumb links={breadcrumbLinks} />

      <div className="">
        <DataTable
          columns={columns}
          data={tableData}
          onRowSelectionChange={setSelectedRows}
          filterColumn="title"
          filterPlaceholder="Filter videos..."
          pagination={{
            itemsPerPage: pagination.limit,
            currentPage: pagination.page,
            totalItems: tableData.length,
            totalPages: Math.ceil(tableData.length / pagination.limit),
            onPageChange: (page) => {
              setPagination((prev) => ({ ...prev, page }));
            },
            onItemsPerPageChange: (itemsPerPage) => {
              setPagination({ page: 1, limit: itemsPerPage });
            },
            showItemsPerPage: true,
            showPageInput: true,
            showPageInfo: true,
          }}
          elements={
            <div className="flex justify-end items-center gap-2">
              {selectedRows.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete ({selectedRows.length})
                </Button>
              )}
              {user?.role === UserRole.SUDOADMIN && (
                <Button
                  variant="destructive"
                  onClick={() => navigate("/dashboard/deleted-videos")}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  View Deleted
                </Button>
              )}
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Video
              </Button>
            </div>
          }
        />
      </div>

      {/* Create Modal */}
      <VideoCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        productId={productId as string}
      />

      {/* Delete Alert Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              video from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
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
