export interface DownloadCategory {
  id: string;
  productId: string;
  kind: string; // "SOFTWARE" | "DRIVER" | "DOCUMENTATION" | etc.
  title: string;
  subtitle?: string;
  iconKey?: string;
  isActive: boolean;
  extra?: {
    platforms?: string[];
    updateChannel?: string;
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductDownload {
  id: string;
  productId: string;
  categoryId: string;
  title: string;
  summary: string;
  version: string;
  releasedOn?: string; // ISO date string
  sizeBytes: number;
  downloadUrl: string;
  platforms: string[];
  minOsVersion?: string;
  fileType: string;
  sha256?: string;
  deprecated: boolean;
  isActive: boolean;
  sortOrder: number;
  extra?: {
    language?: string[];
    note?: string;
    [key: string]: any;
  };
  mirrors?: Array<{
    label: string;
    url: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDownloadCategoryPayload {
  productId: string;
  kind: string;
  title: string;
  subtitle?: string;
  iconKey?: string;
  isActive: boolean;
  extra?: {
    platforms?: string[];
    updateChannel?: string;
    [key: string]: any;
  };
}

export interface CreateProductDownloadPayload {
  productId: string;
  categoryId: string;
  title: string;
  summary: string;
  version: string;
  sizeBytes: number;
  downloadUrl: string | File;
  platforms?: string[];
  fileType: string;
  deprecated: boolean;
  isActive: boolean;
  sortOrder: number;
  mirrors?: Array<{
    label: string;
    url: string;
  }>;
}
