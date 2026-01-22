import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FilePenLine, Loader, ArrowLeft, X } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { useCreatePax } from "@/hooks/usePax";

interface CreatePaxSheetProps {
  id: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePaxSheet({
  id,
  isOpen,
  onClose,
}: CreatePaxSheetProps) {
  const params = useParams();
  // const [isUpdating, setIsUpdating] = useState(false);
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);
  const [minError, setMinError] = useState<string>("");
  const [maxError, setMaxError] = useState<string>("");
  const [discountError, setDiscountError] = useState<string>("");

  const { mutateAsync: createPax, isPending: isUpdating } = useCreatePax();

  const validateMin = (value: number) => {
    if (!value) return "Minimum number of people is required";
    if (value < 1) return "Minimum number must be at least 1";
    return true;
  };

  const validateMax = (value: number, min: number) => {
    if (!value) return "Maximum number of people is required";
    if (value < 1) return "Maximum number must be at least 1";
    if (value < min)
      return "Maximum number must be greater than or equal to minimum number";
    return true;
  };

  const validateDiscount = (value: number) => {
    if (value < 0) return "Discount cannot be negative";
    if (value == 0) return "Discount must be greater than 0";
    return true;
  }

  const validateForm = () => {
    const minValid = validateMin(min);
    const maxValid = validateMax(max, min);
    const discountValid = validateDiscount(discount);

    setMinError(typeof minValid === "string" ? minValid : "");
    setMaxError(typeof maxValid === "string" ? maxValid : "");
    setDiscountError(typeof discountValid === "string" ? discountValid : "");

    return typeof minValid === "string" || typeof maxValid === "string" || typeof discountValid === "string";
  };

  const handleSubmit = async () => {
    if (validateForm()) return;

    try {
      const payload = {
        min,
        max,
        discount,
      };

      await createPax(
        { packageId: params.id ?? "", ...payload },
        {
          onSuccess: () => {
            toast.success("Pax details created successfully.");
            setMin(1);
            setMax(1);
            setDiscount(0);
            onClose();
          },
          onError: (error) => {
            toast.error(error.message || "Failed to create pax details.");
          },
        }
      );
    } catch (error: any) {
      toast.error("Something went wrong while updating.");
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Create Pax
            </h1>
            <p className="text-sm text-muted-foreground">
              Add the Pax details below
            </p>
          </div>
        </div>

        <X className="h-4 w-4" onClick={onClose} />
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block font-medium">Minimum Number</label>
          <input
            type="number"
            className={`p-2 border w-full ${minError ? "border-red-500" : "border-gray-300"
              }`}
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            min={1}
          />
          {minError && <p className="text-red-500 text-sm mt-1">{minError}</p>}
        </div>

        <div>
          <label className="block font-medium">Maximum Number</label>
          <input
            type="number"
            className={`p-2 border w-full ${maxError ? "border-red-500" : "border-gray-300"
              }`}
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            min={1}
          />
          {maxError && <p className="text-red-500 text-sm mt-1">{maxError}</p>}
        </div>

        <div>
          <label className="block font-medium">Price Per Person</label>
          <input
            type="number"
            className={`p-2 border w-full ${discountError ? "border-red-500" : "border-gray-300"
              }`}
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            min={0}
          />
          {discountError && (
            <p className="text-red-500 text-sm mt-1">{discountError}</p>
          )}
        </div>
      </div>

      <Button
        disabled={isUpdating}
        className="mt-6 float-end"
        type="button"
        onClick={handleSubmit}
      >
        {isUpdating ? (
          <Loader size={16} className="animate-spin mr-2" />
        ) : (
          <FilePenLine size={16} className="mr-1" />
        )}
        Create Pax
      </Button>
    </div>
  );
}
