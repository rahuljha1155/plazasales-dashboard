import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { ISellingPoint } from "@/types/ISellingPoint";

interface SellingPointViewModalProps {
  sellingPoint: ISellingPoint;
  open: boolean;
  onClose: () => void;
}

export function SellingPointViewModal({
  sellingPoint,
  open,
  onClose,
}: SellingPointViewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Selling Point Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <img
              src={sellingPoint.icon}
              alt={sellingPoint.title}
              className="w-24 h-24 object-cover rounded border"
            />
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{sellingPoint.title}</h3>
              <p className="text-gray-600 mt-1">{sellingPoint.subtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Brand</p>
              <p className="font-medium">{sellingPoint.brand?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sort Order</p>
              <Badge variant="secondary">{sellingPoint.sortOrder}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="text-sm">
                {new Date(sellingPoint.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Updated At</p>
              <p className="text-sm">
                {new Date(sellingPoint.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
