import type {
  ICreateProductRequest,
  ICreateProductResponse,
  IGetAllProductsQuery,
  IGetAllProductsResponse,
  IGetProductBySlugOrIdResponse,
  IUpdateProductRequest,
  IUpdateProductResponse,
  IDeleteProductResponse,
  IProductStatsResponse,
} from "@/types/IProduct";
import { api2 } from "./api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// === Get All Products ===
export const getAllProducts = async (
  params?: IGetAllProductsQuery
): Promise<IGetAllProductsResponse> => {
  const res = await api2.get<IGetAllProductsResponse>(
    "/product/get-all-products",
    { params }
  );
  return res.data;
};

export const useGetAllProducts = (params?: IGetAllProductsQuery) => {
  return useQuery({
    queryKey: ["getAllProducts", params],
    queryFn: () => getAllProducts(params),
  });
};

// === Get Product By Slug or ID ===
export const getProductBySlugOrId = async (
  slugOrId: string
): Promise<IGetProductBySlugOrIdResponse> => {
  const res = await api2.get<IGetProductBySlugOrIdResponse>(
    `/product/get-product/${slugOrId}`
  );
  return res.data;
};

export const useGetProductBySlugOrId = (slugOrId: string) => {
  return useQuery({
    queryKey: ["getProductBySlugOrId", slugOrId],
    queryFn: () => getProductBySlugOrId(slugOrId),
    enabled: !!slugOrId,
  });
};

// === Create Product ===
export const createProduct = async (
  data: ICreateProductRequest
): Promise<ICreateProductResponse> => {
  const res = await api2.post<ICreateProductResponse>(
    "/product/create-product",
    data
  );
  return res.data;
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["createProduct"],
    mutationFn: createProduct,
    onSuccess: (data) => {
      // Invalidate all product-related queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["getAllProducts"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsBySubcategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsByCategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductStats"] });

      toast.success(
        (data as any)?.message || "Product created successfully",
        { position: "bottom-right" }
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create product",
        { position: "bottom-right" }
      );
    },
  });
};

// === Update Product ===
export const updateProduct = async (
  productId: string,
  data: IUpdateProductRequest
): Promise<IUpdateProductResponse> => {
  const res = await api2.put<IUpdateProductResponse>(
    `/product/update-product/${productId}`,
    data
  );
  return res.data;
};

export const useUpdateProduct = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateProduct", productId],
    mutationFn: (data: IUpdateProductRequest) => updateProduct(productId, data),
    onSuccess: (data) => {
      // Invalidate all product-related queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["getAllProducts"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsBySubcategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsByCategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductBySlugOrId", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["getProductStats"] });

      toast.success(
        (data as any)?.message || "Product updated successfully",
        { position: "bottom-right" }
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update product",
        { position: "bottom-right" }
      );
    },
  });
};

// === Delete Product ===
export const deleteProduct = async (
  productId: string
): Promise<IDeleteProductResponse> => {
  const res = await api2.delete<IDeleteProductResponse>(
    `/product/delete-product/${productId}`
  );
  return res.data;
};

export const useDeleteProduct = (productId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["deleteProduct", productId],
    mutationFn: () => deleteProduct(productId),
    onSuccess: (data) => {
      // Invalidate all product-related queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["getAllProducts"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsBySubcategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsByCategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductStats"] });
      queryClient.invalidateQueries({ queryKey: ["getDeletedProducts"] });

      toast.success(
        (data as any)?.message || "Product deleted successfully",
        { position: "bottom-right" }
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete product",
        { position: "bottom-right" }
      );
    },
  });
};

// === Get Products By Subcategory ===
export const getProductsBySubcategory = async (
  subcategoryId: string,
  params?: IGetAllProductsQuery
): Promise<IGetAllProductsResponse> => {
  const res = await api2.get<IGetAllProductsResponse>(
    `/product/get-subcategory-products/${subcategoryId}`,
    { params }
  );
  return res.data;
};

export const useGetProductsBySubcategory = (
  subcategoryId: string,
  params?: IGetAllProductsQuery
) => {
  return useQuery({
    queryKey: ["getProductsBySubcategory", subcategoryId, params],
    queryFn: () => getProductsBySubcategory(subcategoryId, params),
    enabled: !!subcategoryId,
  });
};



// export const useGetProductsByCategory = (
//   categoryId: string,
//   params?: IGetAllProductsQuery
// ) => {
//   return useQuery({
//     queryKey: ["getProductsByCategory", categoryId, params],
//     queryFn: () => getProductsByCategory(categoryId, params),
//     enabled: !!categoryId,
//   });
// };

// === Get Product Stats ===
export const getProductStats = async (): Promise<IProductStatsResponse> => {
  const res = await api2.get<IProductStatsResponse>("/product/stats");
  return res.data;
};

export const useGetProductStats = () => {
  return useQuery({
    queryKey: ["getProductStats"],
    queryFn: getProductStats,
  });
};

// === Deleted Products APIs ===
export const getDeletedProducts = async (page: number = 1, limit: number = 10) => {
  const response = await api2.get(`/product/deleted-products?page=${page}&limit=${limit}`);
  return response.data;
};

export const useGetDeletedProducts = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["getDeletedProducts", page, limit],
    queryFn: () => getDeletedProducts(page, limit)
  });
};

export const recoverProducts = async (ids: string[]) => {
  const response = await api2.put("/product/recover-products", { ids });
  return response.data;
};

export const useRecoverProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["recoverProducts"],
    mutationFn: (ids: string[]) => recoverProducts(ids),
    onSuccess: (data) => {
      // Invalidate all product-related queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["getAllProducts"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsBySubcategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsByCategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductStats"] });
      queryClient.invalidateQueries({ queryKey: ["getDeletedProducts"] });

      toast.success(data.message || "Products recovered successfully", {
        position: "bottom-right",
        description: "The selected products have been recovered successfully."
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to recover products", {
        position: "bottom-right",
        description: "An error occurred while recovering the products."
      });
    }
  });
};

export const destroyProductsPermanently = async (productIds: string) => {
  const response = await api2.delete(`/product/destroy-product/${productIds}`);
  return response.data;
};

export const useDestroyProductsPermanently = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["destroyProductsPermanently"],
    mutationFn: (productIds: string) => destroyProductsPermanently(productIds),
    onSuccess: (data) => {
      // Invalidate all product-related queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ["getDeletedProducts"] });
      queryClient.invalidateQueries({ queryKey: ["getProductStats"] });

      toast.success(data.message || "Products permanently deleted", {
        position: "bottom-right",
        description: "The products have been permanently deleted from the system."
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete products permanently", {
        position: "bottom-right",
        description: "An error occurred while permanently deleting the products."
      });
    }
  });
};

// === Update Product Sort Order ===
export const updateProductSortOrder = async (
  productId: string,
  sortOrder: number
): Promise<any> => {
  const res = await api2.put(`/product/update-product/${productId}`, {
    sortOrder
  });
  return res.data;
};

export const useUpdateProductSortOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["updateProductSortOrder"],
    mutationFn: ({ productId, sortOrder }: { productId: string; sortOrder: number }) =>
      updateProductSortOrder(productId, sortOrder),
    onSuccess: () => {
      // Invalidate all product queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["getAllProducts"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsBySubcategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsByCategory"] });
    }
  });
};

// === Toggle Product Published Status ===
export const toggleProductPublished = async (
  productId: string,
  isPublished: boolean
): Promise<any> => {
  const res = await api2.put(`/product/update-product/${productId}`, {
    isPublished
  });
  return res.data;
};

export const useToggleProductPublished = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["toggleProductPublished"],
    mutationFn: ({ productId, isPublished }: { productId: string; isPublished: boolean }) =>
      toggleProductPublished(productId, isPublished),
    onSuccess: (data) => {
      // Invalidate all product queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["getAllProducts"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsBySubcategory"] });
      queryClient.invalidateQueries({ queryKey: ["getProductsByCategory"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });

      toast.success(
        (data as any)?.message || "Product status updated successfully",
        { position: "bottom-right" }
      );
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update product status",
        { position: "bottom-right" }
      );
    }
  });
};