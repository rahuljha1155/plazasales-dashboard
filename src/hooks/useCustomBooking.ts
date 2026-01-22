import { customBookingApi } from "@/apis/api-call";
import type { Booking, BookingsResponse } from "@/types/booking";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetCustomBookings = () => {
  return useQuery<BookingsResponse>({
    queryKey: ["custom-bookings"],
    queryFn: async () => {
      const response = await customBookingApi.getAll();
      return response.data;
    },
  });
};

export const useGetCustomBookingById = (id: string) => {
  return useQuery<{ data: Booking }>({
    queryKey: ["custom-bookings", id],
    queryFn: async () => {
      const response = await customBookingApi.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useDeleteCustomBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await customBookingApi.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-bookings"] });
    },
  });
};
