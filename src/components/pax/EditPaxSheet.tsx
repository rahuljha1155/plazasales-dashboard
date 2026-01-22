import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FilePenLine, Loader, ArrowLeft, X } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useUpdatePax } from "@/hooks/usePax";

interface EditPaxSheetProps {
  id: string;
  onClose: () => void;
}

export default function EditPaxSheet({ id, onClose }: EditPaxSheetProps) {
  // const [isUpdating, setIsUpdating] = useState(false);

  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(1);

  const [discount, setDiscount] = useState<number>(0);

  const [minError, setMinError] = useState<string>("");
  const [maxError, setMaxError] = useState<string>("");
  const [discountError, setDiscountError] = useState<string>("");

  const { mutateAsync: updatePax, isPending: isUpdating } = useUpdatePax(id);

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
    return true

  };

  const validateForm = () => {
    const minValid = validateMin(min);
    const maxValid = validateMax(max, min);

    const discountValid = validateDiscount(discount);


    setMinError(typeof minValid === "string" ? minValid : "");
    setMaxError(typeof maxValid === "string" ? maxValid : "");
    setDiscountError(typeof discountValid === "string" ? discountValid : "");


    return (
      typeof minValid === "string" ||
      typeof maxValid === "string" ||
      typeof discountValid === "string"

    );
  };

  const handleSubmit = async () => {
    if (validateForm()) return;

    try {
      const payload = {
        min,
        max,
        discount,
      };

      await updatePax(payload, {
        onSuccess: () => {
          toast.success("Pax details updated successfully.");
          onClose();
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update pax details.");
        },
      });
    } catch (error: any) {
      toast.error("Something went wrong while updating.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`pax/${id}`);
        const info = data?.data;

        setMin(info?.min || 1);
        setMax(info?.max || 1);
        setDiscount(info?.discount || 0);
      } catch (error) {
        toast.error("Failed to load pax data.");
      }
    };

    if (id) fetchData();
  }, [id]);

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Edit Pax
            </h1>
            <p className="text-sm text-muted-foreground">Update the Pax details below</p>
          </div>
        </div>
        <X
          className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground"
          onClick={onClose}
        />
      </div>

      <div className="bg-card rounded-sm border p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Minimum Number</label>
            <input
              type="number"
              className={`w-full px-3 py-2 border rounded-[2px] ${minError ? "border-red-500" : "border-input"
                } focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
              value={min}
              onChange={(e) => setMin(Number(e.target.value))}
              min={1}
            />
            {minError && (
              <p className="text-red-500 text-xs mt-1">{minError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Maximum Number</label>
            <input
              type="number"
              className={`w-full px-3 py-2 border rounded-[2px] ${maxError ? "border-red-500" : "border-input"
                } focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              min={1}
            />
            {maxError && (
              <p className="text-red-500 text-xs mt-1">{maxError}</p>
            )}
          </div>


          <div>
            <label className="block text-sm font-medium mb-1">Price Per Person</label>
            <div className="relative">
              <input
                type="number"
                className={`w-full pr-12 pl-3 py-2 border rounded-[2px] ${discountError ? "border-red-500" : "border-input"
                  } focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                min={0}
                max={100}
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">US$</span>
            </div>
            {discountError && (
              <p className="text-red-500 text-xs mt-1">{discountError}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button
            variant="outline"
            className="mr-4"
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            disabled={isUpdating}
            onClick={handleSubmit}
            className="min-w-[120px]"
          >
            {isUpdating ? (
              <>
                <Loader className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FilePenLine className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
