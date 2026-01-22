import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetHomeTestimonials = () => {
  return useQuery({
    queryKey: ["home-testimonials"],
    queryFn: async () => {
      const response = await api.get("home-testimonial");
      return response.data.data;
    },
  });
};

export const useCreateHomeTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post("home-testimonial", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-testimonials"] });
    },
  });
};

export const useUpdateHomeTestimonial = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.patch(`home-testimonial/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-testimonial", id] });
      queryClient.invalidateQueries({ queryKey: ["home-testimonials"] });
    },
  });
};

export const useDeleteHomeTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`home-testimonial/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-testimonials"] });
    },
  });
};
