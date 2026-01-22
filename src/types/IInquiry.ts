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

// Core Inquiry model
export interface IInquiry {
  id: string
  createdAt: string
  updatedAt: string
  sortOrder: number
  isDeleted: boolean
  name: string
  email: string
  phone: string
  address: string
  message: string
  product: {
    id: string
    name: string
  },
  brand: {
    id: string
    name: string
  },
  replies: [],
  isHandled: boolean
}

/**
 * POST /inquiry/create-inquiry
 */
export interface ICreateInquiryRequest {
  subject: string;
  message: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
}

export interface ICreateInquiryResponse {
  success: boolean;
  data: IInquiry;
  meta?: IApiResponseMeta;
  error?: IApiError;
}

/**
 * GET /inquiry/get-all-inquiries
 */
export interface IGetAllInquiriesResponse {
  data: {
    inquiries: IInquiry[];
    total: number
    page: number
    limit: number
    totalPages: number
  },
  status: number;
  cached: boolean;
}

/**
 * GET /inquiry/get-inquiry/:id
 */
export interface IGetInquiryByIdPath {
  id: string;
}

export interface IGetInquiryByIdResponse {
  status: number;
  inquiry: Inquiry;
}


interface Product {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  name: string;
  sku: string;
  coverImage: string;
  detailImage: string[];
  slug: string;
  model: string;
  manualUrl: string | null;
  brochureUrl: string | null;
  price: string;
  yearlyPrice: string | null;
  mrp: string;
  shortDescription: string;
  description: string;
  technology: string;
  feature: string; // JSON string, you might want to parse this to a specific interface
  metaTitle: string;
  metatag: string[];
  metadescription: string;
  isPublished: boolean;
  isPopular: boolean;
}

interface Brand {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  name: string;
  slug: string;
  logoUrl: string;
  certificate: string;
  indoorImage: string;
  outdoorImage: string;
  youtubeId: string | null;
  themeColor: string;
  description: string;
  usp: string;
  isAuthorizedDistributor: boolean;
  bannerUrls: string[];
}

interface InquiryReply {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  message: string;
}

interface Inquiry {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  isDeleted: boolean;
  name: string;
  email: string;
  phone: string;
  address: string;
  message: string;
  product: Product | null;
  brand: Brand;
  replies: InquiryReply[];
  isHandled: boolean;
}

interface InquiryResponse {
  status: number;
  inquiry: Inquiry;
}

// Optional: If you want to parse the feature JSON string
interface ProductFeatures {
  capacity: string;
  power: string;
  innerPot: string;
  autoShutOff: boolean;
  keepWarm: boolean;
}

/**
 * PUT /inquiry/update-inquiry/:id
 */
export interface IUpdateInquiryRequest {
  subject?: string;
  message?: string;
  status?: "pending" | "resolved" | "closed" | string;
}

export interface IUpdateInquiryResponse {
  success: boolean;
  data: IInquiry;
  error?: IApiError;
}

/**
 * DELETE /inquiry/delete-inquiry/:id
 */
export interface IDeleteInquiryResponse {
  success: boolean;
  data?: { id: string };
  error?: IApiError;
}