import { useState } from "react";
import { useCreateSellingPoint } from "@/hooks/useSellingPoint";
import { useGetBrands } from "@/services/brand";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { SellingPointForm } from "./SellingPointForm";
import type { SellingPointFormData } from "@/schema/sellingPoint";

interface SellingPointCreateSheetProps {
  defaultBrandId?: string;
}

export function SellingPointCreateSheet({ defaultBrandId }: SellingPointCreateSheetProps) {
  const [open, setOpen] = useState(false);
  const createPoint = useCreateSellingPoint();
  const { data: brandsData } = useGetBrands();

  const brands = brandsData?.data?.brands || [];

  const handleSubmit = async (data: SellingPointFormData) => {
    await createPoint.mutateAsync(data);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Selling Point
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Selling Point</SheetTitle>
          <SheetDescription>
            Add a new selling point for a brand
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <SellingPointForm
            onSubmit={handleSubmit}
            isLoading={createPoint.isPending}
            brands={brands}
            defaultBrandId={defaultBrandId}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
