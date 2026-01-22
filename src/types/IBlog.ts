
export interface IBlogResponse {
  status: number;
  data: IBlogData;
  cached: boolean;
}

export interface IBlogBySlugResponse {
  status: number;
  data: IBlog;
}

export interface IBlogData {
  blogs: IBlog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IBlog {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  title: string;
  slug: string;
  excerpt: string;
  isPublished: boolean;
  isActive?: boolean;
  banner?: string;
  description: string; // JSON string (you may parse this later)
  coverImage: string | null;
  publishedAt: string | null;
  author: IAuthor | string;
  estimatedReadTime: number;
  mediaAssets: IMediaAsset[];
}

export interface IAuthor {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  firstname: string;
  middlename: string | null;
  lastname: string;
  email: string;
  phone: string | null;
  gender: string;
  isVerified: boolean;
  address: string | null;
  createdBy: string | null;
  profilePicture: string | null;
  role: string;
}

export interface IMediaAsset {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  fileUrl: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT" | string;
}

export interface IDeleteBlogResponse {
  status: number;
  message: string
  deletedBlogIds: string[]
}

export interface ICreateBlogData {
  title: string;
  slug: string;
  excerpt: string;
  isPublished: boolean;
  description: string; // JSON string
  coverImage: File | null;
  estimatedReadTime: number;
  mediaUrls: File[];
}

export interface IBlogDetailsResponse {
  status: number;
  blog: IBlogDetails;
  similarBlogs: IBlog[];
}

export interface IBlogDetails extends IBlog {
  seoMetadata: ISeoMetadata | null;
}

export interface ISeoMetadata {
  id: string;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string[];
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
}