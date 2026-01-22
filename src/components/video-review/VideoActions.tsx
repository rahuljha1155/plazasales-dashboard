import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye } from "lucide-react";
import type { VideoReviewItem } from "@/types/viewReview";

interface VideoActionsProps {
  item: VideoReviewItem;
  onView: (item: VideoReviewItem) => void;
  onEdit: (item: VideoReviewItem) => void;
  onDelete: (id: string) => void;
}

export function VideoActions({
  item,
  onView,
  onEdit,
  onDelete,
}: VideoActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onView(item)}
        title="View Video"
        className="text-primary hover:text-orange-700"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(item)}
        title="Edit"
        className="text-gray-600 hover:text-gray-900"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(item._id)}
        title="Delete"
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
