import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Calendar, ArrowUpDown } from "lucide-react";

interface CategoryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    addToHome: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
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
      <DialogContent className="max-w-2xl [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold">
              {category.name}
            </DialogTitle>
            <div className="flex gap-2">
              {category.addToHome && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Featured on Home
                </Badge>
              )}
              <Badge variant="outline" className="flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3" />
                Sort: {category.sortOrder || 0}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Image */}
          {category.image && (
            <div className="relative rounded-sm overflow-hidden h-48 bg-muted">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Category Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Slug
              </h3>
              <div className="p-3 bg-muted/50 rounded-[2px] font-mono text-sm">
                {category.slug}
              </div>
            </div>

            {category.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Description
                </h3>
                <div
                  className="prose max-w-none p-3 bg-muted/50 rounded-[2px]"
                  dangerouslySetInnerHTML={{ __html: category.description }}
                />
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p>{format(new Date(category.createdAt), "MMM d, yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p>{format(new Date(category.updatedAt), "MMM d, yyyy")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
