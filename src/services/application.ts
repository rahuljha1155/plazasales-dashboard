import type {
  IApplication,
  IGetAllApplicationsQuery,
  IGetAllApplicationsResponse,
  IGetApplicationByIdResponse,
  IUpdateApplicationRequest,
  IUpdateApplicationResponse,
  IDeleteApplicationResponse,
  IGetDeletedApplicationsResponse,
  IRecoverApplicationsRequest,
  IRecoverApplicationsResponse,
} from '@/types/IApplication';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api2 } from './api';

const base = '/application';

export const applicationKeys = {
  all: ['application'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (query?: IGetAllApplicationsQuery) => [...applicationKeys.lists(), query ?? {}] as const,
  byCareer: (careerId: string, query?: IGetAllApplicationsQuery) => [...applicationKeys.all, 'career', careerId, query ?? {}] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
  deleted: () => [...applicationKeys.all, 'deleted'] as const,
  deletedList: (page: number, limit: number) => [...applicationKeys.deleted(), { page, limit }] as const,
};

// List all applications
export function useApplications(query?: IGetAllApplicationsQuery) {
  return useQuery({
    queryKey: applicationKeys.list(query),
    queryFn: () => getAllApplications(query),
  });
}

// List applications by career ID
export function useApplicationsByCareer(careerId: string, query?: IGetAllApplicationsQuery) {
  return useQuery({
    queryKey: applicationKeys.byCareer(careerId, query),
    queryFn: () => getApplicationsByCareer(careerId, query),
    enabled: Boolean(careerId),
  });
}

// Get single application
export function useApplication(id: string, enabled = true) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => getApplicationById(id),
    enabled: Boolean(id) && enabled,
  });
}

// Update application
export function useUpdateApplication(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: IUpdateApplicationRequest) => updateApplication(id, payload),
    onSuccess: () => {
      toast.success('Application updated successfully');
      qc.invalidateQueries({ queryKey: applicationKeys.detail(id) });
      qc.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to update application';
      toast.error(message);
    },
  });
}

// Delete application
export function useDeleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteApplications(ids),
    onSuccess: () => {
      toast.success('Application(s) deleted successfully');
      qc.invalidateQueries({ queryKey: applicationKeys.lists() });
      qc.invalidateQueries({ queryKey: applicationKeys.deleted() });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to delete application';
      toast.error(message);
    },
  });
}

// Get deleted applications
export function useGetDeletedApplications(page: number, limit: number) {
  return useQuery({
    queryKey: applicationKeys.deletedList(page, limit),
    queryFn: () => getDeletedApplications(page, limit),
  });
}

// Recover applications
export function useRecoverApplications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => recoverApplications(ids),
    onSuccess: () => {
      toast.success('Application(s) recovered successfully');
      qc.invalidateQueries({ queryKey: applicationKeys.deleted() });
      qc.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to recover applications';
      toast.error(message);
    },
  });
}

// Permanently destroy application
export function useDestroyApplicationPermanently() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => destroyApplicationPermanently(id),
    onSuccess: () => {
      toast.success('Application permanently deleted');
      qc.invalidateQueries({ queryKey: applicationKeys.deleted() });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to permanently delete application';
      toast.error(message);
    },
  });
}

// API Functions
export async function getAllApplications(params?: IGetAllApplicationsQuery) {
  const res = await api2.get<IGetAllApplicationsResponse>(`${base}/get-all-applications`);
  return res.data;
}

export async function getApplicationsByCareer(careerId: string, params?: IGetAllApplicationsQuery) {
  const res = await api2.get<IGetAllApplicationsResponse>(`${base}/get-applications-by-career/${careerId}`, {
    params,
  });
  return res.data;
}

export async function getApplicationById(id: string) {
  const res = await api2.get<IGetApplicationByIdResponse>(`${base}/get-application/${id}`);
  return res.data;
}

export async function updateApplication(id: string, payload: IUpdateApplicationRequest) {
  const res = await api2.put<IUpdateApplicationResponse>(`${base}/update-application/${id}`, payload);
  return res.data;
}

export async function deleteApplications(ids: string[]) {
  const res = await api2.delete<IDeleteApplicationResponse>(`${base}/delete-application/${ids.join(',')}`);
  return res.data;
}

export async function getDeletedApplications(page: number, limit: number) {
  const res = await api2.get<IGetDeletedApplicationsResponse>(`${base}/deleted-applications`, {
    params: { page, limit },
  });
  return res.data;
}

export async function recoverApplications(ids: string[]) {
  const res = await api2.post<IRecoverApplicationsResponse>(`${base}/recover-applications`, { ids });
  return res.data;
}

export async function destroyApplicationPermanently(id: string) {
  const res = await api2.delete<IDeleteApplicationResponse>(`${base}/delete-application/${id}`);
  return res.data;
}
