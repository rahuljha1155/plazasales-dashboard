import type {
  ISellingPoint,
  ICreateSellingPointPayload,
  IUpdateSellingPointPayload,
  IGetAllSellingPointsResponse,
  IGetSellingPointResponse,
  ICreateSellingPointResponse,
  IUpdateSellingPointResponse,
  IDeleteSellingPointResponse,
  IRecoverSellingPointsPayload,
} from "@/types/ISellingPoint";
import { api2 } from "./api";

export const sellingPointServices = {
  // Create new selling point
  createSellingPoint: async (data: ICreateSellingPointPayload): Promise<ICreateSellingPointResponse> => {
    const formData = new FormData();
    formData.append("brandId", data.brandId);
    formData.append("title", data.title);
    formData.append("subtitle", data.subtitle);

    if (data.sortOrder !== undefined) {
      formData.append("sortOrder", data.sortOrder.toString());
    }

    // Only append icon if it exists and is not empty
    if (data.icon) {
      if (data.icon instanceof File) {
        formData.append("icon", data.icon);
      } else if (typeof data.icon === "string" && data.icon.trim() !== "") {
        formData.append("icon", data.icon);
      }
    }

    const response = await api2.post<ICreateSellingPointResponse>(
      "/brand-selling-point/create-brand-selling-point",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Get all selling points with pagination and filters
  getAllSellingPoints: async (
    page?: number,
    limit?: number,
    search: string = "",
    brandId?: string
  ): Promise<IGetAllSellingPointsResponse> => {
    let url = `/brand-selling-point/get-all-brand-selling-points`;

    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());
    if (search) params.append("search", encodeURIComponent(search));
    if (brandId) params.append("brandId", brandId);

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await api2.get<IGetAllSellingPointsResponse>(url);
    return response.data;
  },

  // Get selling point by ID
  getSellingPointById: async (id: string): Promise<IGetSellingPointResponse> => {
    const response = await api2.get<IGetSellingPointResponse>(
      `/brand-selling-point/get-brand-selling-point/${id}`
    );
    return response.data;
  },

  // Get selling points by brand identifier (UUID or slug)
  getSellingPointsByBrand: async (identifier: string): Promise<IGetAllSellingPointsResponse> => {
    const response = await api2.get<IGetAllSellingPointsResponse>(
      `/brand-selling-point/get-brand-selling-points/brand/${identifier}`
    );
    return response.data;
  },

  // Update selling point
  updateSellingPoint: async (
    id: string,
    data: IUpdateSellingPointPayload
  ): Promise<IUpdateSellingPointResponse> => {
    const formData = new FormData();

    if (data.brandId) formData.append("brandId", data.brandId);
    if (data.title) formData.append("title", data.title);
    if (data.subtitle) formData.append("subtitle", data.subtitle);
    if (data.sortOrder !== undefined) formData.append("sortOrder", data.sortOrder.toString());

    // Only append icon if it's a File (new upload), not if it's a string URL (existing icon)
    if (data.icon && data.icon instanceof File) {
      formData.append("icon", data.icon);
    }

    const response = await api2.put<IUpdateSellingPointResponse>(
      `/brand-selling-point/update-brand-selling-point/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Delete selling point (soft delete)
  deleteSellingPoint: async (ids: string | string[]): Promise<IDeleteSellingPointResponse> => {
    const idString = Array.isArray(ids) ? ids.join(",") : ids;
    const response = await api2.delete<IDeleteSellingPointResponse>(
      `/brand-selling-point/delete-brand-selling-point/${idString}`
    );
    return response.data;
  },

  // Get deleted selling points
  getDeletedSellingPoints: async (page: number = 1, limit: number = 10): Promise<IGetAllSellingPointsResponse> => {
    const response = await api2.get<IGetAllSellingPointsResponse>(
      `/brand-selling-point/deleted-brand-selling-points?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // Recover deleted selling points
  recoverSellingPoints: async (payload: IRecoverSellingPointsPayload): Promise<IDeleteSellingPointResponse> => {
    const response = await api2.put<IDeleteSellingPointResponse>(
      "/brand-selling-point/recover-brand-selling-points",
      payload
    );
    return response.data;
  },

  // Permanently destroy selling points
  destroySellingPoints: async (ids: string | string[]): Promise<IDeleteSellingPointResponse> => {
    const idString = Array.isArray(ids) ? ids.join(",") : ids;
    const response = await api2.delete<IDeleteSellingPointResponse>(
      `/brand-selling-point/destroy-brand-selling-points/${idString}`
    );
    return response.data;
  },
};
