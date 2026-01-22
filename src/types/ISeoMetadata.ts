export enum EntityType {
  PRODUCT = "PRODUCT",
  BLOG = "BLOG",
  CATEGORY = "CATEGORY",
  SUBCATEGORY = "SUBCATEGORY",
  BRAND = "BRAND",
  SITE = "SITE",
}

export interface ISeoOpenGraph {
  title: string;
  description: string;
  type: string;
  url: string;
  siteName: string;
  images: string[];
  locale: string;
}

export interface ISeoTwitter {
  card: string;
  title: string;
  description: string;
  images: string[];
}

export interface ISeoRobots {
  index: boolean;
  follow: boolean;
  maxSnippet: number;
  maxImagePreview: string;
  maxVideoPreview: number;
}

export interface ISeoAlternates {
  languages: {
    [key: string]: string;
  };
}

export interface ISeoJsonLd {
  "@context": string;
  "@type": string;
  [key: string]: any;
}

export interface ISeoExtraMeta {
  themeColor?: string;
  category?: string;
  [key: string]: any;
}

export interface ISeoMetadata {
  id: string;
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  openGraph: Record<string, any>;
  twitter: Record<string, any>;
  robots: Record<string, any>;
  alternates: Record<string, any>;
  jsonLd: Record<string, any>;
  extraMeta: Record<string, any>;
  isIndexable: boolean;
  isOptimized: boolean;
  openGraphImages?: string[];
  twitterImages?: string[];
  sitemapFile?: string;
  manifestFile?: string;
  entityType: EntityType;
  entityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateSeoMetadataRequest {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  openGraph: Record<string, any>;
  twitter: Record<string, any>;
  robots: Record<string, any>;
  alternates: Record<string, any>;
  jsonLd: Record<string, any>;
  extraMeta: Record<string, any>;
  isIndexable: boolean;
  isOptimized: boolean;
  openGraphImages?: File[];
  twitterImages?: File[];
  sitemapFile?: File;
  manifestFile?: File;
  entityType?: EntityType;
  entityId?: string;
}

export interface ISeoMetadataResponse {
  status: number;
  message: string;
  data: ISeoMetadata;
}

export interface IGetAllSeoMetadataQuery {
  page?: number;
  limit?: number;
  entityType?: EntityType;
  search?: string;
}

export interface IGetAllSeoMetadataResponse {
  status: number;
  data: {
    seoMetadata: ISeoMetadata[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
