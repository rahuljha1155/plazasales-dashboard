import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetTestimonials = () => {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const response = await api.get("testimonial");
      return response.data.data;
    },
  });
};

export const useGetTestimonial = (id: string) => {
  return useQuery({
    queryKey: ["testimonial", id],
    queryFn: async () => {
      const response = await api.get(`testimonial/${id}`);
      return response.data.data;
    },
  });
};

export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post("testimonial", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
};

export const useUpdateTestimonial = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.patch(`testimonial/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonial", id] });
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
};

export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`testimonial/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials"] });
    },
  });
};
