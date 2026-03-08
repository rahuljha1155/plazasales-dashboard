// Selling Point Types

export interface ISellingPoint {
  id: string;
  brandId: string;
  icon: string;
  title: string;
  subtitle: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ICreateSellingPointPayload {
  brandId: string;
  icon: string | File;
  title: string;
  subtitle: string;
  sortOrder?: number;
}

export interface IUpdateSellingPointPayload {
  brandId?: string;
  icon?: string | File;
  title?: string;
  subtitle?: string;
  sortOrder?: number;
}

export interface IGetAllSellingPointsResponse {
  status: number;
  data: {
    brandSellingPoints: ISellingPoint[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export interface IGetSellingPointResponse {
  status: number;
  brandSellingPoint: ISellingPoint;
  message?: string;
}

export interface ICreateSellingPointResponse {
  status: number;
  data: ISellingPoint;
  message: string;
}

export interface IUpdateSellingPointResponse {
  status: number;
  data: ISellingPoint;
  message: string;
}

export interface IDeleteSellingPointResponse {
  status: number;
  message: string;
}

export interface IRecoverSellingPointsPayload {
  ids: string[];
}
