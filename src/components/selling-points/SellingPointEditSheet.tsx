import { useUpdateSellingPoint } from "@/hooks/useSellingPoint";
import { useGetBrands } from "@/services/brand";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SellingPointForm } from "./SellingPointForm";
import type { SellingPointFormData } from "@/schema/sellingPoint";
import type { ISellingPoint } from "@/types/ISellingPoint";

interface SellingPointEditSheetProps {
  sellingPoint: ISellingPoint;
  open: boolean;
  onClose: () => void;
}

export function SellingPointEditSheet({
  sellingPoint,
  open,
  onClose,
}: SellingPointEditSheetProps) {
  const updatePoint = useUpdateSellingPoint(sellingPoint.id);
  const { data: brandsData } = useGetBrands();

  const brands = brandsData?.data?.brands || [];

  const handleSubmit = async (data: SellingPointFormData) => {
    await updatePoint.mutateAsync(data);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Selling Point</SheetTitle>
          <SheetDescription>
            Update the selling point details
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <SellingPointForm
            onSubmit={handleSubmit}
            isLoading={updatePoint.isPending}
            defaultValues={sellingPoint}
            brands={brands}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
