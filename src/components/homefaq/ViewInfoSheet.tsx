"use client";

import { format } from "date-fns";
import { Calendar, Edit, FileText, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { homefaq } from "@/types/homefaq";

interface ViewInfoSheetProps {
  info: homefaq | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}

export function ViewInfoSheet({
  info,
  open,
  onOpenChange,
  onEdit,
}: ViewInfoSheetProps) {
  if (!info) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <div>
              <DialogTitle className="text-2xl">{info.name}</DialogTitle>
              <DialogDescription className="mt-1">
                Homefaq Details
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                onEdit();
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Homefaq Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <Tag className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="text-sm font-medium">{info.name || "-"}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <FileText className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm font-medium whitespace-pre-line">
                    {info.description || "No description provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Metadata
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p className="text-sm font-medium">
                    {info.createdAt
                      ? format(new Date(info.createdAt), "MMM d, yyyy")
                      : "-"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Updated At</p>
                  <p className="text-sm font-medium">
                    {info.updatedAt
                      ? format(new Date(info.updatedAt), "MMM d, yyyy")
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
