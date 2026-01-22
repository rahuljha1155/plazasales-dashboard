import { ItemTable } from "@/components/custom-booking/Item-Table";
import { TableShimmer } from "@/components/table-shimmer";
import { useGetCustomBookings } from "@/hooks/useCustomBooking";
import { Suspense } from "react";

export default function CustomBookingPage() {
  const { data: datas, isLoading } = useGetCustomBookings();

  return (
    <div className="container mx-auto py-2">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Custom Bookings</h1>
      </div>

      <Suspense fallback={<TableShimmer />}>
        <ItemTable pkgs={(datas?.data as any) || []} isLoading={isLoading} />
      </Suspense>
    </div>
  );
}
