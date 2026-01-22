// Common API response meta and error
export interface IApiResponseMeta {
  total?: number;
  page?: number;
  pageSize?: number;
  [key: string]: any;
}

export interface IApiError {
  message: string;
  code?: string | number;
  details?: any;
}

// Core Gallery model
export interface IGallery {
  id: string;                // UUID
  name: string;
  description?: string;
  images: string[];          // Array of image URLs
  productIds?: string[];     // Associated product IDs
  isActive?: boolean;
  createdAt?: string;        // ISO date
  updatedAt?: string;        // ISO date
  [key: string]: any;        // allow backend extensions
}

/**
 * POST /gallery/create-gallery
 */
export interface ICreateGalleryRequest {
  name: string;
  description?: string;
  images: string[];
  productIds?: string[];
  isActive?: boolean;
}

export interface ICreateGalleryResponse {
  success: boolean;
  data: IGallery;
  meta?: IApiResponseMeta;
  error?: IApiError;
}

/**
 * GET /gallery/get-all-galleries
 */
export interface IGetAllGalleriesResponse {
  success: boolean;
  data: IGallery[];
  meta?: IApiResponseMeta;
  error?: IApiError;
}

/**
 * GET /gallery/get-gallery/:id
 */
export interface IGetGalleryByIdPath {
  id: string;
}

export interface IGetGalleryByIdResponse {
  success: boolean;
  data: IGallery | null;
  error?: IApiError;
}

/**
 * PUT /gallery/update-gallery/:id
 */
export interface IUpdateGalleryRequest {
  name?: string;
  description?: string;
  images?: string[];
  productIds?: string[];
  isActive?: boolean;
}

export interface IUpdateGalleryResponse {
  success: boolean;
  data: IGallery;
  error?: IApiError;
}

/**
 * DELETE /gallery/delete-gallery/:id
 */
export interface IDeleteGalleryResponse {
  success: boolean;
  data?: { id: string };
  error?: IApiError;
}