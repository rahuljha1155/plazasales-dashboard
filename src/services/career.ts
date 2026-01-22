import type {
  ICareer,
  ICreateCareerRequest,
  ICreateCareerResponse,
  IGetAllCareersQuery,
  IGetAllCareersResponse,
  IGetCareerByIdResponse,
  IUpdateCareerRequest,
  IUpdateCareerResponse,
  IDeleteCareerResponse,
} from '@/types/ICareer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api2 } from './api';


// List
export function useCareers(query?: IGetAllCareersQuery) {
  return useQuery({
    queryKey: careerKeys.list(query),
    queryFn: () => getAllCareers(query),
    // Add staleTime/cacheTime/retry here if your project’s defaults differ
  });
}

// Detail
export function useCareer(id: string, enabled = true) {
  return useQuery({
    queryKey: careerKeys.detail(id),
    queryFn: () => getCareerById(id),
    enabled: Boolean(id) && enabled,
  });
}

// Create
export function useCreateCareer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ICreateCareerRequest) => createCareer(payload),
    onSuccess: (data) => {
      toast.success('Career created successfully');
      qc.invalidateQueries({ queryKey: careerKeys.lists() });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create career';
      toast.error(message);
    },
  });
}

// Update
export function useUpdateCareer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: IUpdateCareerRequest) => updateCareer(id, payload),
    onSuccess: (data) => {
      toast.success('Career updated successfully');
      qc.invalidateQueries({ queryKey: careerKeys.detail(id) });
      qc.invalidateQueries({ queryKey: careerKeys.lists() });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update career';
      toast.error(message);
    },
  });
}

// Delete
export function useDeleteCareer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCareer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: careerKeys.lists() });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to delete career';
      toast.error(message);
    },
  });
}

const base = '/career';

export const careerKeys = {
  all: ['career'] as const,
  lists: () => [...careerKeys.all, 'list'] as const,
  list: (query?: IGetAllCareersQuery) => [...careerKeys.lists(), query ?? {}] as const,
  details: () => [...careerKeys.all, 'detail'] as const,
  detail: (id: string) => [...careerKeys.details(), id] as const,
};

// GET /career/get-all-careers
export async function getAllCareers(params?: IGetAllCareersQuery) {
  const res = await api2.get<IGetAllCareersResponse>(`${base}/get-all-careers`, {
    params,
  });
  return res.data;
}

// GET /career/get-career/:id
export async function getCareerById(id: string) {
  const res = await api2.get<IGetCareerByIdResponse>(`${base}/get-career/${id}`);
  // Return the entire response as it contains status, message, and career
  return res.data;
}

// POST /career/create-career
export async function createCareer(payload: ICreateCareerRequest) {
  const res = await api2.post<ICreateCareerResponse>(`${base}/create-career`, payload);
  return res.data;
}

// PUT /career/update-career/:id
export async function updateCareer(id: string, payload: IUpdateCareerRequest) {
  const res = await api2.put<IUpdateCareerResponse>(`${base}/update-career/${id}`, payload);
  return res.data;
}

// DELETE /career/delete-career/:id
// Supports bulk delete by comma separated ids: /career/delete-career/id1,id2,id3
export async function deleteCareer(id: string) {
  const res = await api2.delete<IDeleteCareerResponse>(`${base}/delete-career/${id}`);
  return res.data;
}

// Deleted Careers APIs
export async function getDeletedCareers(page: number = 1, limit: number = 10) {
  const res = await api2.get(`${base}/deleted-careers`, {
    params: { page, limit }
  });
  return res.data;
}

export function useGetDeletedCareers(page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['deletedCareers', page, limit],
    queryFn: () => getDeletedCareers(page, limit)
  });
}

export async function recoverCareers(ids: string[]) {
  const res = await api2.put(`${base}/recover-careers`, { ids });
  return res.data;
}

export function useRecoverCareers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => recoverCareers(ids),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['deletedCareers'] });
      qc.invalidateQueries({ queryKey: careerKeys.lists() });
      toast.success(data.message || 'Careers recovered successfully', {
        position: 'bottom-right',
        description: 'The selected careers have been recovered successfully.'
      });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to recover careers';
      toast.error(message, {
        position: 'bottom-right',
        description: 'An error occurred while recovering the careers.'
      });
    }
  });
}

// DELETE /career/destroy-careers/:id
// Supports bulk delete by comma separated ids: /career/destroy-careers/id1,id2,id3
export async function destroyCareerPermanently(id: string) {
  const res = await api2.delete(`${base}/destroy-careers/${id}`);
  return res.data;
}

export function useDestroyCareerPermanently() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => destroyCareerPermanently(id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['deletedCareers'] });
      toast.success(data.message || 'Career permanently deleted', {
        position: 'bottom-right',
        description: 'The career has been permanently deleted from the system.'
      });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Failed to delete career permanently';
      toast.error(message, {
        position: 'bottom-right',
        description: 'An error occurred while deleting the career permanently.'
      });
    }
  });
}