import { bookingApi } from "@/apis/api-call";
import type { Booking, BookingsResponse } from "@/types/booking";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetBookings = () => {
  return useQuery<BookingsResponse>({
    queryKey: ["bookings"],
    queryFn: async () => {
      const response = await bookingApi.getAll();
      return response.data;
    },
  });
};

export const useGetBookingById = (id: string) => {
  return useQuery<{ data: Booking }>({
    queryKey: ["bookings", id],
    queryFn: async () => {
      const response = await bookingApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useDeleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await bookingApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};
