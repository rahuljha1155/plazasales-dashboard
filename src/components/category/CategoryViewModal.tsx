import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, isValid } from "date-fns";
import { Calendar, ArrowUpDown, Tag, Link2 } from "lucide-react";

// Helper function to safely format dates
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return isValid(date) ? format(date, "MMM d, yyyy") : "N/A";
};

interface CategoryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
    brandId: string;
    brandName?: string;
    sortOrder?: number;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
  } | null;
}

export function CategoryViewModal({
  isOpen,
  onClose,
  category,
}: CategoryViewModalProps) {
  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold">
              {category.title}
            </DialogTitle>
            <div className="flex gap-2">
              {category.isDeleted === false && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Active
                </Badge>
              )}
              {category.isDeleted === true && (
                <Badge
                  variant="secondary"
                  className="bg-red-100 text-red-800"
                >
                  Deleted
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {category.coverImage && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border">
              <img
                src={category.coverImage}
                alt={category.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Slug
                </h3>
                <p className="font-mono text-sm bg-muted p-3 rounded-md">
                  {category.slug}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Brand
                </h3>
                <p className="text-sm bg-muted p-3 rounded-md">
                  {category.brandName || category.brandId}
                </p>
              </div>
            </div>

            {category.sortOrder !== undefined && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort Order
                </h3>
                <p className="text-sm bg-muted p-3 rounded-md inline-block">
                  {category.sortOrder}
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground font-medium">Created</p>
                <p className="text-foreground">{formatDate(category.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <div className="text-right">
                <p className="text-muted-foreground font-medium">Last Updated</p>
                <p className="text-foreground">{formatDate(category.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-muted-foreground">
              Category ID: <span className="font-mono">{category.id}</span>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
