import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types for the user data
export interface User {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  firstname: string;
  middlename: string | null;
  lastname: string;
  email: string;
  phone: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  isVerified: boolean;
  address: string;
  createdBy: string | null;
  profilePicture: string | null;
  role: "ADMIN" | "SUDOADMIN" | "USER";
}

interface CreateUserData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  gender: "MALE" | "FEMALE" | "OTHER";
}

interface UpdateUserData {
  firstname?: string;
  lastname?: string;
  phone?: string;
  address?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
}

interface UsersResponse {
  status: number;
  message: string;
  data: {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  cached: boolean;
}

interface UserResponse {
  status: number;
  message: string;
  data: User;
}

// Hook to get all users
export const useGetAllUsers = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["admin", "users", page, limit],
    queryFn: async () => {
      const response = await api.get<UsersResponse>("/admin/get-all-users", {
        params: { page, limit },
      });
      return response.data.data;
    },
  });
};

// Hook to get user by ID
export const useGetUserById = (id: string) => {
  return useQuery({
    queryKey: ["admin", "user", id],
    queryFn: async () => {
      const response = await api.get<UserResponse>(`/admin/get-users/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Hook to create a new user
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await api.post<UserResponse>("/admin/create-users", data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create user");
    },
  });
};

// Hook to update user
export const useUpdateUser = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateUserData) => {
      const response = await api.put<UserResponse>(`/admin/update-users/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "user", id] });
      toast.success("User updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    },
  });
};

// Hook to delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/delete-users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    },
  });
};

// Hook to delete multiple users
export const useDeleteBulkUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await api.delete(`/admin/delete-users/${ids.join(",")}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Users deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete users");
    },
  });
};
