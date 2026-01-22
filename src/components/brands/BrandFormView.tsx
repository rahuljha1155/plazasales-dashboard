import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import Breadcrumb from "@/components/dashboard/Breadcumb";
import { BrandForm } from "./CreateBrandSheet";
import { useGetBrandById } from "@/services/brand";
import { Skeleton } from "@/components/ui/skeleton";

interface BrandFormViewProps {
  mode: "create" | "edit";
  brandId?: string | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BrandFormView({
  mode,
  brandId,
  onSuccess,
  onCancel,
}: BrandFormViewProps) {
  const { data, isLoading } = useGetBrandById(brandId || "");
  const brand = data?.brand;

  if (mode === "edit" && isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <BrandForm
        mode={mode}
        brand={brand}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </div>
  );
}
