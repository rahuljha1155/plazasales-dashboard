export interface HomeGalleryType {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  centerImage: string;
  sideImages: string[];
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface GalleryData {
  galleries: HomeGalleryType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GalleryResponse {
  status: number;
  message: string;
  data: GalleryData;
}
