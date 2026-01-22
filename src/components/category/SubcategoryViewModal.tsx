import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, isValid } from "date-fns";
import { Calendar, ArrowUpDown } from "lucide-react";

// Helper function to safely format dates
const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return isValid(date) ? format(date, "MMM d, yyyy") : "N/A";
};

interface SubcategoryViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  subcategory: {
    _id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    addToHome: boolean;
    isPopular: boolean;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export function SubcategoryViewModal({
  isOpen,
  onClose,
  subcategory,
}: SubcategoryViewModalProps) {
  if (!subcategory) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold">
              {subcategory.name}
            </DialogTitle>
            <div className="flex gap-2">
              {subcategory.addToHome && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  On Homepage
                </Badge>
              )}
              {subcategory.isPopular && (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800"
                >
                  Popular
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {subcategory.image && (
            <div className="relative aspect-video rounded-sm overflow-hidden bg-gray-100">
              <img
                src={subcategory.image}
                alt={subcategory.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">
                Description
              </h3>
              <div
                className="prose max-w-none mt-2"
                dangerouslySetInnerHTML={{
                  __html: subcategory.description || "No description provided",
                }}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Slug
                </h3>
                <p className="font-mono text-sm bg-muted p-2 rounded">
                  {subcategory.slug}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Sort Order
                </h3>
                <p>{subcategory.sortOrder}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Created</p>
                <p>{formatDate(subcategory.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-muted-foreground">Last Updated</p>
                <p>{formatDate(subcategory.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
