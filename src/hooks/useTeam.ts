import type { Member } from "@/types/team-member";
import { teamMemberApi } from "../apis/api-call";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useGetTeamMembers = () =>
  useQuery<Member[]>({
    queryKey: ["team-members"],
    queryFn: async () => {
      const res = await teamMemberApi.getAll();
      // new API returns: { status: number, data: { members: [...], total, page, limit, totalPages } }
      return res.data?.data?.members || [];
    },
  });

export const useGetTeamMemberById = (id: string) =>
  useQuery<Member>({
    queryKey: ["team-members", id],
    queryFn: async () => {
      const res = await teamMemberApi.getOne(id);
      // new API returns: { status: number, member: { ... } }
      return res.data?.member || null;
    },
  });

export const useCreateTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await teamMemberApi.create(data);
      // API returns: { status, message } (and optionally member)
      return res.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["team-members"] }),
  });
};

export const useUpdateTeamMember = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await teamMemberApi.update(id, data);
      return res.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["team-members"] }),
  });
};

export const useDeleteTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await teamMemberApi.delete(id);
      return res.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["team-members"] }),
  });
};

export const useDeleteBulkMembers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const res = await teamMemberApi.deleteBulk(ids);
      return res.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["team-members"] }),
  });
};

export const useUpdateTeamMemberSortOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { members: { id: string; sortOrder: number }[] }) => {
      const res = await teamMemberApi.updateSortOrder(data);
      return res.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["team-members"] }),
  });
};
