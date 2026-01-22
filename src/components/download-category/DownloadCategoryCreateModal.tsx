import React, { useState } from "react";
import { useCreateDownloadCategory } from "@/hooks/useDownloadCategory";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DownloadCategoryCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId?: string;
}



export enum CATEGORYKIND {
  DRIVER = "DRIVER",
  SOFTWARE = "SOFTWARE",
  FIRMWARE = "FIRMWARE",
  MANUAL = "MANUAL",
  BROCHURE = "BROCHURE"
}


export function DownloadCategoryCreateModal({
  open,
  onOpenChange,
  productId,
}: DownloadCategoryCreateModalProps) {
  const createMutation = useCreateDownloadCategory();

  const [formData, setFormData] = useState({
    productId: productId || "",
    kind: CATEGORYKIND.SOFTWARE,
    title: "",
    subtitle: "",
    isActive: true,
    platforms: [] as string[],
    updateChannel: "",
  });

  const [platformInput, setPlatformInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId || !formData.title) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createMutation.mutateAsync({
        productId: formData.productId,
        kind: formData.kind,
        title: formData.title,
        subtitle: formData.subtitle || undefined,
        isActive: formData.isActive,
        extra: {
          platforms: formData.platforms.length > 0 ? formData.platforms : undefined,
          updateChannel: formData.updateChannel || undefined,
        },
      });

      toast.success("Category created successfully");
      onOpenChange(false);
      setFormData({
        productId: productId || "",
        kind: CATEGORYKIND.SOFTWARE,
        title: "",
        subtitle: "",
        isActive: true,
        platforms: [],
        updateChannel: "",
      });
      setPlatformInput("");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to create category");
    }
  };

  const addPlatform = () => {
    if (platformInput && !formData.platforms.includes(platformInput)) {
      setFormData({
        ...formData,
        platforms: [...formData.platforms, platformInput],
      });
      setPlatformInput("");
    }
  };

  const removePlatform = (platform: string) => {
    setFormData({
      ...formData,
      platforms: formData.platforms.filter((p) => p !== platform),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Download Category</DialogTitle>
          <DialogDescription>
            Add a new download category for your product
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">


          <div className="space-y-2">
            <Label htmlFor="kind">
              Kind <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.kind}
              onValueChange={(value) =>
                setFormData({ ...formData, kind: value as CATEGORYKIND })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select kind" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CATEGORYKIND.SOFTWARE}>{CATEGORYKIND.SOFTWARE}</SelectItem>
                <SelectItem value={CATEGORYKIND.BROCHURE}>{CATEGORYKIND.BROCHURE}</SelectItem>
                <SelectItem value={CATEGORYKIND.DRIVER}>{CATEGORYKIND.DRIVER}</SelectItem>
                <SelectItem value={CATEGORYKIND.FIRMWARE}>{CATEGORYKIND.FIRMWARE}</SelectItem>
                <SelectItem value={CATEGORYKIND.MANUAL}>{CATEGORYKIND.MANUAL}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Firmware"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              placeholder="e.g., OTA & Recovery image"
            />
          </div>



          <div className="space-y-2">
            <Label htmlFor="updateChannel">Update Channel</Label>
            <Input
              id="updateChannel"
              value={formData.updateChannel}
              onChange={(e) =>
                setFormData({ ...formData, updateChannel: e.target.value })
              }
              placeholder="e.g., Stable, Beta"
            />
          </div>

          <div className="space-y-2">
            <Label>Platforms</Label>
            <div className="flex gap-2">
              <Input
                value={platformInput}
                onChange={(e) => setPlatformInput(e.target.value)}
                placeholder="e.g., Android, Windows"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPlatform();
                  }
                }}
              />
              <Button type="button" onClick={addPlatform} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.platforms.map((platform) => (
                <div
                  key={platform}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {platform}
                  <button
                    type="button"
                    onClick={() => removePlatform(platform)}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Create Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
