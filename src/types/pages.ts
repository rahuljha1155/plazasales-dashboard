export type PageContent = {
  _id: string;

  title: string;
  subTitle?: string;
  slug: string;
  description?: string;
  subDescription?: string;

  // SEO Metadata
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];

  image?: string;

  status?: "draft" | "published" | "archived";
  publishDate?: Date;

  createdAt: Date;
  updatedAt: Date;
  __v: number;
};



export interface PageData {
  _id: string;
  title: string;
  subTitle?: string;
  slug: string;
  description?: string;
  subDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords: string[];
  image?: string;
  status: "published" | "draft" | string;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PageResponse {
  status: "success" | "error";
  results: number;
  data: PageData;
}
