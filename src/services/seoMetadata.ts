import api, { api2 } from "./api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ICreateSeoMetadataRequest,
  ISeoMetadataResponse,
  IGetAllSeoMetadataQuery,
  IGetAllSeoMetadataResponse,
} from "@/types/ISeoMetadata";

// === Get All SEO Metadata ===
export const getAllSeoMetadata = async (
  params?: IGetAllSeoMetadataQuery
): Promise<IGetAllSeoMetadataResponse> => {
  const res = await api2.get<IGetAllSeoMetadataResponse>(
    "/seo-metadata/get-all",
    { params }
  );
  return res.data;
};

export const useGetAllSeoMetadata = (params?: IGetAllSeoMetadataQuery) => {
  return useQuery({
    queryKey: ["getAllSeoMetadata", params],
    queryFn: () => getAllSeoMetadata(params),
  });
};

// === Get SEO Metadata By ID ===
export const getSeoMetadataById = async (
  id: string
): Promise<ISeoMetadataResponse> => {
  const res = await api2.get<ISeoMetadataResponse>(
    `/seo-metadata/get/${id}`
  );
  return res.data;
};

export const useGetSeoMetadataById = (id: string) => {
  return useQuery({
    queryKey: ["getSeoMetadataById", id],
    queryFn: () => getSeoMetadataById(id),
    enabled: !!id,
  });
};

// === Create SEO Metadata ===
export const createSeoMetadata = async (
  data: ICreateSeoMetadataRequest
): Promise<ISeoMetadataResponse> => {
  const formData = new FormData();

  // Append text fields
  formData.append("slug", data.slug);
  formData.append("title", data.title);
  formData.append("description", data.description);
  formData.append("keywords", JSON.stringify(data.keywords));
  formData.append("canonicalUrl", data.canonicalUrl);
  formData.append("openGraph", JSON.stringify(data.openGraph));
  formData.append("twitter", JSON.stringify(data.twitter));
  formData.append("robots", JSON.stringify(data.robots));
  formData.append("alternates", JSON.stringify(data.alternates));
  formData.append("jsonLd", JSON.stringify(data.jsonLd));
  formData.append("extraMeta", JSON.stringify(data.extraMeta));
  formData.append("isIndexable", String(data.isIndexable));
  formData.append("isOptimized", String(data.isOptimized));

  data?.entityType && formData.append("entityType", data.entityType);
  data?.entityId && formData.append("entityId", data.entityId);

  // Append files
  if (data.openGraphImages) {
    data.openGraphImages.forEach((file) => {
      formData.append("openGraphImages", file);
    });
  }
  if (data.twitterImages) {
    data.twitterImages.forEach((file) => {
      formData.append("twitterImages", file);
    });
  }
  if (data.sitemapFile) {
    formData.append("sitemapFile", data.sitemapFile);
  }
  if (data.manifestFile) {
    formData.append("manifestFile", data.manifestFile);
  }

  const res = await api2.post<ISeoMetadataResponse>(
    "/seo-metadata/create-seo",
    formData
  );
  return res.data;
};

export const useCreateSeoMetadata = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createSeoMetadata"],
    mutationFn: createSeoMetadata,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["getAllSeoMetadata"] });
      toast.success(
        data.message || "SEO metadata created successfully",
        { position: "bottom-right" }
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create SEO metadata",
        { position: "bottom-right" }
      );
    },
  });
};

// === Update SEO Metadata ===
export const updateSeoMetadata = async (
  id: string,
  data: Partial<ICreateSeoMetadataRequest>
): Promise<ISeoMetadataResponse> => {
  const formData = new FormData();

  // Append text fields if they exist
  if (data.slug) formData.append("slug", data.slug);
  if (data.title) formData.append("title", data.title);
  if (data.description) formData.append("description", data.description);
  if (data.keywords) formData.append("keywords", JSON.stringify(data.keywords));
  if (data.canonicalUrl) formData.append("canonicalUrl", data.canonicalUrl);
  if (data.openGraph) formData.append("openGraph", JSON.stringify(data.openGraph));
  if (data.twitter) formData.append("twitter", JSON.stringify(data.twitter));
  if (data.robots) formData.append("robots", JSON.stringify(data.robots));
  if (data.alternates) formData.append("alternates", JSON.stringify(data.alternates));
  if (data.jsonLd) formData.append("jsonLd", JSON.stringify(data.jsonLd));
  if (data.extraMeta) formData.append("extraMeta", JSON.stringify(data.extraMeta));
  if (data.isIndexable !== undefined) formData.append("isIndexable", String(data.isIndexable));
  if (data.isOptimized !== undefined) formData.append("isOptimized", String(data.isOptimized));
  if (data.entityType) formData.append("entityType", data.entityType);
  if (data.entityId) formData.append("entityId", data.entityId);

  // Append files
  if (data.openGraphImages) {
    data.openGraphImages.forEach((file) => {
      formData.append("openGraphImages", file);
    });
  }
  if (data.twitterImages) {
    data.twitterImages.forEach((file) => {
      formData.append("twitterImages", file);
    });
  }
  if (data.sitemapFile) {
    formData.append("sitemapFile", data.sitemapFile);
  }
  if (data.manifestFile) {
    formData.append("manifestFile", data.manifestFile);
  }

  const res = await api.put<ISeoMetadataResponse>(
    `/seo-metadata/update-seo/${id}`,
    formData
  );
  return res.data;
};

export const useUpdateSeoMetadata = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateSeoMetadata", id],
    mutationFn: (data: Partial<ICreateSeoMetadataRequest>) => updateSeoMetadata(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["getAllSeoMetadata"] });
      queryClient.invalidateQueries({ queryKey: ["getSeoMetadataById", id] });
      toast.success(
        data.message || "SEO metadata updated successfully",
        { position: "bottom-right" }
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update SEO metadata",
        { position: "bottom-right" }
      );
    },
  });
};

// === Delete SEO Metadata ===
export const deleteSeoMetadata = async (id: string): Promise<{ status: number; message: string }> => {
  const res = await api2.delete(`/seo-metadata/delete/${id}`);
  return res.data;
};

export const useDeleteSeoMetadata = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteSeoMetadata"],
    mutationFn: deleteSeoMetadata,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["getAllSeoMetadata"] });
      toast.success(
        data.message || "SEO metadata deleted successfully",
        { position: "bottom-right" }
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete SEO metadata",
        { position: "bottom-right" }
      );
    },
  });
};
