import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sellingPointSchema, type SellingPointFormData } from "@/schema/sellingPoint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import * as React from "react";
import { Upload, X } from "lucide-react";
import type { ISellingPoint } from "@/types/ISellingPoint";

interface SellingPointFormProps {
  onSubmit: (data: SellingPointFormData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<ISellingPoint>;
  brands: Array<{ id: string; name: string }>;
  defaultBrandId?: string;
}

export function SellingPointForm({
  onSubmit,
  isLoading,
  defaultValues,
  brands,
  defaultBrandId,
}: SellingPointFormProps) {
  const [iconPreview, setIconPreview] = useState<string | null>(
    defaultValues?.icon || null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SellingPointFormData>({
    resolver: zodResolver(sellingPointSchema),
    defaultValues: {
      brandId: defaultValues?.brandId || defaultBrandId || "",
      title: defaultValues?.title || "",
      subtitle: defaultValues?.subtitle || "",
      sortOrder: defaultValues?.sortOrder || 0,
      icon: defaultValues?.icon || "",
    },
  });

  // Set brandId explicitly when in edit mode
  React.useEffect(() => {
    if (defaultValues?.brandId) {
      setValue("brandId", defaultValues.brandId);
    }
  }, [defaultValues?.brandId, setValue]);

  const handleFormSubmit = (data: SellingPointFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Form errors:", errors);
    onSubmit(data);
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("icon", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeIcon = () => {
    setValue("icon", "");
    setIconPreview(null);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {!defaultValues ? (
        <div className="space-y-2">
          <Label htmlFor="brandId">Brand *</Label>
          <Select
            onValueChange={(value) => setValue("brandId", value)}
            defaultValue={defaultBrandId}
            disabled={!!defaultBrandId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.brandId && (
            <p className="text-sm text-red-500">{errors.brandId.message}</p>
          )}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="Enter selling point title"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            {...register("sortOrder", { valueAsNumber: true })}
            placeholder="0"
          />
          {errors.sortOrder && (
            <p className="text-sm text-red-500">{errors.sortOrder.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle *</Label>
        <Textarea
          id="subtitle"
          {...register("subtitle")}
          placeholder="Enter selling point subtitle"
          rows={3}
        />
        {errors.subtitle && (
          <p className="text-sm text-red-500">{errors.subtitle.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Icon *</Label>
        <p className="text-xs text-muted-foreground mb-2">Recommended: 512x512 pixels, transparent background (PNG)</p>
        <div className="flex items-start gap-4">
          {iconPreview ? (
            <div className="relative flex-shrink-0">
              <img
                src={iconPreview}
                alt="Icon preview"
                className="w-24 h-24 object-contain rounded-lg border-2 border-gray-200 bg-gray-50 p-2"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md"
                onClick={removeIcon}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 flex-shrink-0">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
            <Input
              id="icon"
              type="file"
              accept="image/*"
              onChange={handleIconChange}
            />
          </div>
        </div>
        {errors.icon && (
          <p className="text-sm text-red-500">{errors.icon.message as string}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Back
        </Button>
       <Button 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading
            ? (defaultValues ? "Updating..." : "Creating...")
            : (defaultValues ? "Update" : "Create")}
        </Button>
      </div>
    </form>
  );
}
