export interface IBannerGallery {
    id: string;
    url: string;
}

export interface ITechnology {
    id: string;
    title: string;
    description: string;
    bannerUrls: string[];
    bannerGallery?: IBannerGallery[];
    coverImage: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

export interface ITechnologyResponse {
    status: number;
    data: {
        technologies: ITechnology[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    cached: boolean;
}

export interface ITechnologyByIdResponse {
    status: number;
    data: {
        technology: ITechnology;
    };
    message?: string;
}

export interface ICreateTechnologyResponse {
    status: number;
    data: {
        technology: ITechnology;
    };
    message: string;
}

export interface IUpdateTechnologyResponse {
    status: number;
    data: {
        technology: ITechnology;
    };
    message: string;
}

export interface IDeleteTechnologyResponse {
    status: number;
    message: string;
}

export interface ICreateTechnologyPayload {
    title: string;
    description: string;
    bannerUrls: string[];
    coverImage: string;
}
