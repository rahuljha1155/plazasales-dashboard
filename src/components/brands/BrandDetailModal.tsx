import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Brand } from "./types";

interface BrandDetailModalProps {
  brand: Brand | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BrandDetailModal({
  brand,
  isOpen,
  onClose,
}: BrandDetailModalProps) {
  if (!brand) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
              <img
                src={brand.logoUrl || ""}
                alt={brand.name}
                className="h-full w-full object-contain"
              />
            </div>
            {brand.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Brand Name
              </label>
              <p className="text-base text-gray-900">{brand.name}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Slug
              </label>
              <code className="block px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-mono">
                {brand.slug}
              </code>
            </div>
          </div>

          {/* Theme Color */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">
              Theme Color
            </label>
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-lg border-2 border-gray-200 shadow-sm"
                style={{ backgroundColor: brand.themeColor }}
              />
              <span className="text-base font-mono text-gray-700">
                {brand.themeColor}
              </span>
            </div>
          </div>

          {/* Status Badges */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">
              Status
            </label>
            <div className="flex gap-2">
              <Badge
                variant={brand.isAuthorizedDistributor ? "default" : "secondary"}
                className="flex items-center gap-1.5"
              >
                <Icon
                  icon={
                    brand.isAuthorizedDistributor
                      ? "solar:verified-check-bold"
                      : "solar:close-circle-bold"
                  }
                  width="14"
                />
                {brand.isAuthorizedDistributor
                  ? "Authorized Distributor"
                  : "Not Authorized"}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1.5">
                <Icon icon="solar:tag-bold" width="14" />
                {/* {brand.usp} */}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {/* {brand.description && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Description
              </label>
              <div
                className="prose prose-sm max-w-none text-gray-700 bg-gray-50 rounded-lg p-4 border"
                dangerouslySetInnerHTML={{ __html: brand.description }}
              />
            </div>
          )} */}

          {/* Banner Images */}
          {brand.bannerUrls && brand.bannerUrls.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Banner Images
              </label>
              <div className="grid grid-cols-2 gap-3">
                {brand.bannerUrls.map((url, index) => (
                  <div
                    key={index}
                    className="aspect-video rounded-lg border border-gray-200 overflow-hidden bg-gray-50"
                  >
                    <img
                      src={url}
                      alt={`Banner ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Indoor/Outdoor Images */}
          <div className="grid grid-cols-2 gap-4">
            {/* {brand.indoorImage && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                  <Icon icon="solar:home-2-bold" width="16" />
                  Indoor Image
                </label>
                <div className="aspect-video rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                  <img
                    src={brand.indoorImage}
                    alt="Indoor"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )} */}

            {/* {brand.outdoorImage && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                  <Icon icon="solar:sun-2-bold" width="16" />
                  Outdoor Image
                </label>
                <div className="aspect-video rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                  <img
                    src={brand.outdoorImage}
                    alt="Outdoor"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )} */}
          </div>

          {/* Certificate */}
          {brand.certificate && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Icon icon="solar:document-bold" width="16" />
                Authorization Certificate
              </label>
              <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                <img
                  src={brand.certificate}
                  alt="Certificate"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Created At
              </label>
              <p className="text-sm text-gray-700">
                {/* {new Date(brand.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })} */}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Last Updated
              </label>
              <p className="text-sm text-gray-700">
                {/* {new Date(brand.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })} */}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
