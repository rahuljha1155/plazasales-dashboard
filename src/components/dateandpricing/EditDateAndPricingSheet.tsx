import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { FilePenLine, Loader, ArrowLeft, X } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useParams, useLocation } from "react-router-dom";
import { useUpdateFixedDate } from "@/hooks/useDate";

interface EditDateAndPricingSheetProps {
  id: string;
  onClose: () => void;
}

export default function EditDateAndPricingSheet({
  id,
  onClose,
}: EditDateAndPricingSheetProps) {
  const params = useParams();
  const location = useLocation();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [status, setStatus] = useState<"Open" | "Closed" | "Booked">("Open");
  const [numberOfPerson, setNumberOfPerson] = useState<number>(1);
  const [pricePerPerson, setPricePerPerson] = useState<number>(0);

  const { mutateAsync: updateDateAndPrice, isPending: isUpdating } =
    useUpdateFixedDate(id);

  // Extract duration from URL hash
  const duration = useMemo(() => {
    const hash = location.hash;
    if (!hash) return null;

    // Remove the # and parse as number directly (e.g., #60 -> 60)
    const hashValue = hash.replace('#', '').trim();
    const parsedDuration = parseInt(hashValue, 10);

    return !isNaN(parsedDuration) && parsedDuration > 0 ? parsedDuration : null;
  }, [location.hash]);

  // Handle start date change and auto-calculate end date if duration exists
  const handleStartDateChange = (value: string) => {
    setStartDate(value);

    if (value && duration) {
      const start = new Date(value);
      const end = new Date(start);
      end.setDate(end.getDate() + duration);

      // Format date as YYYY-MM-DD for input
      const endDateString = end.toISOString().split('T')[0];
      setEndDate(endDateString);
    }
  };

  const validateDates = () => {
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      toast.error("End date must be after start date");
      return false;
    }
    return true;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`fixed-date/${id}`);
        const info = data?.data;
        setStartDate(info?.startDate?.split("T")[0]);
        setEndDate(info?.endDate?.split("T")[0]);
        setStatus(info?.status || "Open");
        setNumberOfPerson(info?.numberOfPerson || 1);
        setPricePerPerson(info?.pricePerPerson || 0);
      } catch (error: any) {
      }
    };

    fetchData();
  }, [id]);

  const onSubmit = async () => {
    if (!validateDates()) return;

    try {
      const payload = {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        status,
        numberOfPerson,
        pricePerPerson,
        packageId: params.id,
      };

      await updateDateAndPrice(payload, {
        onSuccess: () => {
          toast.success("Date and pricing updated successfully");
          onClose();
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to update date and pricing");
        },
      });
    } catch (error: any) {
      toast.error("An error occurred while updating date and pricing");
    }
  };

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Edit Date & Pricing
            </h1>
            <p className="text-sm text-muted-foreground">
              Update the date and pricing details below
            </p>
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
            <label className="block text-sm font-medium mb-1">
              Start Date
              {duration && (
                <span className="text-xs text-muted-foreground ml-2">
                  (Duration: {duration} days)
                </span>
              )}
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-[2px] border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              End Date
              {duration && (
                <span className="text-xs text-muted-foreground ml-2">
                  (Auto-calculated)
                </span>
              )}
            </label>
            <input
              type="date"
              className={`w-full px-3 py-2 border rounded-[2px] focus:outline-none focus:ring-2 focus:ring-offset-2 ${endDate && startDate && new Date(endDate) <= new Date(startDate)
                ? "border-red-500 focus:ring-red-500"
                : "border-input focus:ring-ring"
                }`}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || ""}
              disabled={duration !== null && startDate !== ""}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border rounded-[2px] border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "Open" | "Closed" | "Booked")
              }
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Booked">Booked</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Number of Persons
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border rounded-[2px] border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={numberOfPerson}
              onChange={(e) => setNumberOfPerson(Number(e.target.value))}
              min={1}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Price per Person
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                US$
              </span>
              <input
                type="number"
                className="w-full pl-12 pr-3 py-2 border rounded-[2px] border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={pricePerPerson}
                onChange={(e) => setPricePerPerson(Number(e.target.value))}
                min={0}
                step="0.01"
                required
              />
            </div>
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
            onClick={onSubmit}
            disabled={isUpdating}
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
