import { Suspense, useState } from "react";
import { Plus, Video as VideoIcon } from "lucide-react";
import { VideoActions } from "@/components/video-review/VideoActions";
import { Button } from "@/components/ui/button";
import { TableShimmer } from "@/components/table-shimmer";
import { ItemForm } from "./item-form";
import { EditVideoForm } from "./edit-video-form";
import {
  useGetVideoReviewsbyPackageId,
  useDeleteVideoReview,
} from "@/hooks/useVideoReview";
import type { VideoReviewItem } from "@/types/viewReview";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
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
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { VideoViewModal } from "@/components/video-review/VideoViewModal";

interface VideoReviewTableProps {
  items: VideoReviewItem[];
  onEdit: (item: VideoReviewItem) => void;
  onDelete: (id: string) => void;
}

const VideoReviewTable = ({
  items,
  onEdit,
  onDelete,
}: VideoReviewTableProps) => {
  // ============= search params ===============///
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const subCategory = searchParams.get("subcategory");
  const packagename = searchParams.get("package");

  const links = [
    { label: "package" },
    { label: category || "Category" },
    { label: subCategory || "Subcategory" },
    { label: packagename || "Package" },

    { label: "Video Review", isActive: true },
  ];
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<VideoReviewItem | null>(null);

  interface ColumnDef<T> {
    id?: string;
    accessorKey?: keyof T | string;
    header: string | React.ReactNode;
    cell: (props: { row: { original: T } }) => React.ReactNode;
  }

  const columns: ColumnDef<VideoReviewItem>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="font-medium">
          <button
            className="text-left hover:underline"
            onClick={() => setViewingItem(row.original)}
          >
            {row.original.title}
          </button>
        </div>
      ),
    },
    // {
    //   accessorKey: "description",
    //   header: "Description",
    //   cell: ({ row }) => (
    //     <div className="text-sm text-gray-500 line-clamp-1">
    //       {row.original.description || "No description"}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "videoUrl",
      header: "Video",
      cell: ({ row }) => (
        <div className="flex items-center">
          <VideoIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span className="text-sm text-gray-500 truncate max-w-[200px]">
            {row.original.videoUrl?.split("/").pop() || "No video"}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const handleEdit = (item: VideoReviewItem) => {
          onEdit(item);
        };

        return (
          <VideoActions
            item={row.original}
            onView={setViewingItem}
            onEdit={handleEdit}
            onDelete={setItemToDelete}
          />
        );
      },
    },
  ];

  return (
    <>
      <Breadcrumb links={links} />
      <div className="rounded-[2px] border">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {columns.map((column) => (
                <th
                  key={column.id || column.accessorKey}
                  className="text-left p-4"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-b hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={column.id || column.accessorKey} className="p-4">
                    {column.cell
                      ? column.cell({ row: { original: item } })
                      : column.accessorKey &&
                        item[column.accessorKey as keyof VideoReviewItem] !=
                        null
                        ? String(
                          item[column.accessorKey as keyof VideoReviewItem]
                        )
                        : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently delete the selected item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete) {
                  onDelete(itemToDelete);
                  setItemToDelete(null);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Video View Modal */}
      {viewingItem && (
        <VideoViewModal
          isOpen={!!viewingItem}
          onClose={() => setViewingItem(null)}
          videoUrl={viewingItem.videoUrl}
          title={viewingItem.title}
          description={viewingItem.description}
          createdAt={viewingItem.createdAt}
          updatedAt={viewingItem.updatedAt}
        />
      )}
    </>
  );
};

export default function VideoReviewPage() {
  const params = useParams();
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useGetVideoReviewsbyPackageId(params.id as string);
  const { mutate: deleteReview } = useDeleteVideoReview();

  const [isAdding, setIsAdding] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<VideoReviewItem | null>(null);

  const videoReviews = response?.data || [];

  const handleDelete = (id: string) => {
    deleteReview(id, {
      onSuccess: () => {
        toast.success("Video review deleted successfully");
        refetch();
      },
      onError: () => {
        toast.error("Failed to delete video review");
      },
    });
  };

  return (
    <div className="container mx-auto py-2">
      {isAdding ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Add Video Review
            </h1>
            <Button onClick={() => setIsAdding(false)} variant="outline">
              Back to List
            </Button>
          </div>
          <ItemForm
            onSuccess={() => {
              refetch();
              setIsAdding(false);
            }}
            onCancel={() => setIsAdding(false)}
          />
        </div>
      ) : itemToEdit ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Video Review
            </h1>
            <Button onClick={() => setItemToEdit(null)} variant="outline">
              Back to List
            </Button>
          </div>
          <EditVideoForm
            item={itemToEdit}
            onSuccess={() => {
              refetch();
              setItemToEdit(null);
              toast.success("Video review updated successfully");
            }}
            onCancel={() => setItemToEdit(null)}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Video Review</h1>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Video Review
            </Button>
          </div>

          {isLoading ? (
            <TableShimmer />
          ) : videoReviews.length > 0 ? (
            <Suspense fallback={<TableShimmer />}>
              <VideoReviewTable
                items={videoReviews}
                onEdit={setItemToEdit}
                onDelete={handleDelete}
              />
            </Suspense>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-sm">
              <VideoIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No video reviews yet
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Get started by adding a new video review
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
