import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { useGetBrandById } from "@/services/brand";

interface BrandDetailViewProps {
  brandId: string;
  onBack: () => void;
}

export function BrandDetailView({ brandId, onBack }: BrandDetailViewProps) {
  const { data, isLoading } = useGetBrandById(brandId);
  const brand = data?.brand;

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded" />
              <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="h-4 w-64 ml-11" />
          </div>
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Content Skeleton */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 space-y-6">
            {/* Brand Header Skeleton */}
            <div className="flex items-center gap-4 pb-6 border-b">
              <Skeleton className="h-16 w-16 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>

            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />

            {/* Images Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Skeleton className="aspect-video w-full" />
              <Skeleton className="aspect-video w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="w-full flex items-center justify-center h-96">
        <div className="text-center">
          <Icon icon="solar:sad-circle-bold" className="mx-auto text-gray-400" width="64" />
          <p className="mt-4 text-gray-600">Brand not found</p>
          <Button onClick={onBack} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full space-y-4">


      {/* Content Section */}
      <div className="bg-muted/80 rounded-lg ">
        <div className="p-6 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-4 pb-6 border-b">
            <div className="w-16 ">
              <img
                src={brand.logoUrl || ""}
                alt={brand.name}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                Brand Name
              </label>
              <p className="text-base text-gray-900">{brand.name}</p>
            </div>

            <div className="space-y-2 flex flex-col">
              <label className="text-sm font-semibold text-gray-600">
                Slug
              </label>
              <code className=" text-gray-700 rounded-lg text-sm font-mono">
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
                className="size-6 rounded-full"
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
            <div className="grid grid-cols-2 w-full gap-2">
              <span
                className="flex items-center gap-1.5"
              >
                <Icon
                  icon={
                    brand.isAuthorizedDistributor
                      ? "solar:verified-check-bold"
                      : "solar:close-circle-bold"
                  }
                  width="14"
                  className="size-5"
                />
                {brand.isAuthorizedDistributor
                  ? "Authorized Distributor"
                  : "Not Authorized"}
              </span>
              <span className="flex flex-col  gap-2">
                <span className="text-sm font-semibold text-gray-600">USP</span>
                {brand.usp}
              </span>
            </div>
          </div>

          {/* App Store Links */}
          {(brand.playStoreUrl || brand.appStoreUrl) && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">
                App Store Links
              </label>
              <div className="flex flex-wrap gap-3">
                {brand.playStoreUrl && (
                  <a
                    href={brand.playStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Icon icon="logos:google-play-icon" width="20" />
                    <span className="text-sm font-medium text-gray-700">Play Store</span>
                    <Icon icon="solar:arrow-right-up-line-duotone" width="16" className="text-gray-500" />
                  </a>
                )}
                {brand.appStoreUrl && (
                  <a
                    href={brand.appStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Icon icon="logos:apple-app-store" width="20" />
                    <span className="text-sm font-medium text-gray-700">App Store</span>
                    <Icon icon="solar:arrow-right-up-line-duotone" width="16" className="text-gray-500" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {brand.description && (
            <div className="space-y-2">
              <label className=" font-semibold text-xl">
                Description
              </label>
              <div
                className="prose prose-sm max-w-none mt-2"
                dangerouslySetInnerHTML={{ __html: brand.description }}
              />
            </div>
          )}

          {/* Brand Feature Image */}
          {brand.brandImageUrls && (
            <div className="space-y-2">
              <label className="text-xl font-semibold">
                Brand Feature Image
              </label>
              <div className="aspect-video max-w-2xl mt-2 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                <img
                  src={Array.isArray(brand.brandImageUrls) ? brand.brandImageUrls[0] : brand.brandImageUrls}
                  alt="Brand Feature"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Banner Images */}
          {brand.bannerUrls && brand.bannerUrls.length > 0 && (
            <div className="space-y-2">
              <label className="text-xl font-semibold ">
                Banner Images
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 mt-3 gap-3">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brand.indoorImage && (
              <div className="space-y-2">
                <label className="text-xl font-semibold  flex items-center gap-2">
                  Indoor Image
                </label>
                <div className="aspect-video  rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                  <img
                    src={brand.indoorImage}
                    alt="Indoor"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            {brand.outdoorImage && (
              <div className="space-y-2">
                <label className="text-xl font-semibold  flex items-center gap-2">
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
            )}
          </div>

          {/* Certificate */}
          {brand.certificate && (
            <div className="space-y-2">
              <label className="text-xl font-semibold  flex items-center gap-2">
                Authorization Certificate
              </label>
              <div className="rounded-lg max-w-2xl border border-gray-200 overflow-hidden bg-gray-50">
                <img
                  src={brand.certificate}
                  alt="Certificate"
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Created At
              </label>
              <p className="text-sm text-gray-700">
                {new Date(brand.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">
                Last Updated
              </label>
              <p className="text-sm text-gray-700">
                {new Date(brand.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
