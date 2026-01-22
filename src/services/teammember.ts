import type {
  ITeamMember,
  ICreateTeamMemberRequest,
  ICreateTeamMemberResponse,
  IGetAllTeamMembersResponse,
  IGetTeamMemberByIdResponse,
  IUpdateTeamMemberRequest,
  IUpdateTeamMemberResponse,
  IDeleteTeamMemberResponse,
  IDeletedMembersResponse,
  IRecoverMembersResponse,
} from "@/types/ITeammember";
import { api2 } from "./api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// === Get All Team Members ===
export const getAllTeamMembers = async (): Promise<IGetAllTeamMembersResponse> => {
  const res = await api2.get<IGetAllTeamMembersResponse>("/team/get-all-members");
  return res.data;
};

export const useGetAllTeamMembers = () => {
  return useQuery({
    queryKey: ["getAllTeamMembers"],
    queryFn: getAllTeamMembers,
  });
};

// === Get Team Member By ID ===
export const getTeamMemberById = async (
  memberId: string
): Promise<IGetTeamMemberByIdResponse> => {
  const res = await api2.get<IGetTeamMemberByIdResponse>(
    `/team/get-member/${memberId}`
  );
  return res.data;
};

export const useGetTeamMemberById = (memberId: string) => {
  return useQuery({
    queryKey: ["getTeamMemberById", memberId],
    queryFn: () => getTeamMemberById(memberId),
    enabled: !!memberId,
  });
};

// === Create Team Member ===
export const createTeamMember = async (
  data: ICreateTeamMemberRequest
): Promise<ICreateTeamMemberResponse> => {
  const res = await api2.post<ICreateTeamMemberResponse>(
    "/team/create-member",
    data
  );
  return res.data;
};

export const useCreateTeamMember = () => {
  return useMutation({
    mutationKey: ["createTeamMember"],
    mutationFn: createTeamMember,
    onSuccess: (data) => {
      toast.success(
        (data as any)?.message || "Team member created successfully",
        { position: "bottom-right" }
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create team member",
        { position: "bottom-right" }
      );
    },
  });
};

// === Update Team Member ===
export const updateTeamMember = async (
  memberId: string,
  data: IUpdateTeamMemberRequest
): Promise<IUpdateTeamMemberResponse> => {
  const res = await api2.put<IUpdateTeamMemberResponse>(
    `/team/update-member/${memberId}`,
    data
  );
  return res.data;
};

export const useUpdateTeamMember = (memberId: string) => {
  return useMutation({
    mutationKey: ["updateTeamMember", memberId],
    mutationFn: (data: IUpdateTeamMemberRequest) => updateTeamMember(memberId, data),
    onSuccess: (data) => {
      toast.success(
        (data as any)?.message || "Team member updated successfully",
        { position: "bottom-right" }
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update team member",
        { position: "bottom-right" }
      );
    },
  });
};

// === Delete Team Member ===
export const deleteTeamMember = async (
  memberId: string
): Promise<IDeleteTeamMemberResponse> => {
  const res = await api2.delete<IDeleteTeamMemberResponse>(
    `/team/delete-member/${memberId}`
  );
  return res.data;
};

export const useDeleteTeamMember = (memberId: string) => {
  return useMutation({
    mutationKey: ["deleteTeamMember", memberId],
    mutationFn: () => deleteTeamMember(memberId),
    onSuccess: (data) => {
      toast.success(
        (data as any)?.message || "Team member deleted successfully",
        { position: "bottom-right" }
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete team member",
        { position: "bottom-right" }
      );
    },
  });
};

// === Get Deleted Members ===
export const getDeletedMembers = async (
  page: number = 1,
  limit: number = 10
): Promise<IDeletedMembersResponse> => {
  const res = await api2.get<IDeletedMembersResponse>(
    `/team/deleted-members?page=${page}&limit=${limit}`
  );
  return res.data;
};

export const useGetDeletedMembers = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["getDeletedMembers", page, limit],
    queryFn: () => getDeletedMembers(page, limit),
  });
};

// === Recover Members ===
export const recoverMembers = async (ids: string[]): Promise<IRecoverMembersResponse> => {
  const res = await api2.post<IRecoverMembersResponse>("/team/recover-members", { ids });
  return res.data;
};

export const useRecoverMembers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["recoverMembers"],
    mutationFn: (ids: string[]) => recoverMembers(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["getDeletedMembers"] });
      queryClient.invalidateQueries({ queryKey: ["getAllTeamMembers"] });
      toast.success(data.message || "Members recovered successfully", {
        position: "bottom-right",
        description: "The selected members have been recovered successfully.",
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to recover members",
        {
          position: "bottom-right",
          description: "An error occurred while recovering the members.",
        }
      );
    },
  });
};

// === Destroy Member Permanently ===
export const destroyMemberPermanently = async (id: string) => {
  const res = await api2.delete(`/team/destroy-members/${id}`);
  return res.data;
};

export const useDestroyMemberPermanently = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["destroyMemberPermanently"],
    mutationFn: (id: string) => destroyMemberPermanently(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["getDeletedMembers"] });
      toast.success(data.message || "Member permanently deleted", {
        position: "bottom-right",
        description: "The member has been permanently deleted from the system.",
      });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete member permanently",
        {
          position: "bottom-right",
          description: "An error occurred while deleting the member permanently.",
        }
      );
    },
  });
};