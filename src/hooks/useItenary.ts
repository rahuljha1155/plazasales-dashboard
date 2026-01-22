import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetItineraries = (packageId: string) => {
  return useQuery({
    queryKey: ["itineraries", packageId],
    queryFn: async () => {
      const response = await api.get(`itinerary/package/${packageId}`);
      return response.data.data;
    },
  });
};

export const useGetItinerary = (id: string) => {
  return useQuery({
    queryKey: ["itinerary", id],
    queryFn: async () => {
      const response = await api.get(`itinerary/${id}`);
      return response.data.data;
    },
  });
};

export const useCreateItinerary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { packageId: string; formData: FormData }) => {
      const { packageId, formData } = data;
      const response = await api.post(`itinerary/${packageId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["itineraries", variables.packageId] });
    },
  });
};

export const useUpdateItinerary = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.put(`itinerary/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itinerary", id] });
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
    },
  });
};

export const useDeleteItinerary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`itinerary/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["itineraries"] });
    },
  });
};