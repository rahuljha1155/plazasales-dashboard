import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Calendar, Users, Percent, Hash } from "lucide-react";

interface PaxData {
  _id: string;
  min: number;
  max: number;
  discount: number;
  createdAt: string;
  updatedAt: string;
}

interface PaxViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  paxData: PaxData | null;
}

export function PaxViewModal({ isOpen, onClose, paxData }: PaxViewModalProps) {
  if (!paxData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:top-2 [&>button]:right-2 [&>button]:z-10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Pax Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted/50 p-6 rounded-sm space-y-4">
            <h3 className="text-lg font-semibold">Pax Details</h3>
            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Minimum Pax:</span>{" "}
                    <span className="text-lg font-bold text-blue-600">
                      {paxData.min}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">Maximum Pax:</span>{" "}
                    <span className="text-lg font-bold text-green-600">
                      {paxData.max}
                    </span>
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    <span className="font-medium">Discount:</span>{" "}
                    <span className="text-lg font-bold text-orange-600">
                      US$ {paxData.discount}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <span className="font-medium">ID:</span> {paxData._id}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Created:</span>{" "}
                  {format(new Date(paxData.createdAt), "PPP")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-medium">Updated:</span>{" "}
                  {format(new Date(paxData.updatedAt), "PPP")}
                </span>
              </div>
            </div>
          </div>

          {/* Pax Range Visualization */}
          <div className="bg-muted/50 p-6 rounded-sm">
            <h3 className="text-lg font-semibold mb-4">Pax Range</h3>
            <div className="flex items-center justify-between bg-white p-4 rounded-sm border">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {paxData.min}
                </div>
                <div className="text-sm text-muted-foreground">Minimum</div>
              </div>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-gradient-to-r from-blue-200 to-green-200 rounded-full"></div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {paxData.max}
                </div>
                <div className="text-sm text-muted-foreground">Maximum</div>
              </div>
            </div>
            {paxData.discount > 0 && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-2 rounded-full">
                  <Percent className="h-4 w-4" />
                  <span className="font-medium">
                    {paxData.discount}% Discount Applied
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
