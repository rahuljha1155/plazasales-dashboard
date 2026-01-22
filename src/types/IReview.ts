export interface IReview {
    _id: string;
    reviewerName: string;
    reviewerEmail: string;
    title: string;
    comment: string;
    rating: number;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface IReviewResponse {
    status: number;
    message: string;
    data: IReview[];
    pagination?: {
        total: number;
        currentPage: number;
        totalPages: number;
        itemsPerPage: number;
    };
}

export interface ISingleReviewResponse {
    status: number;
    message: string;
    data: IReview;
}

export interface ICreateReviewResponse {
    status: number;
    message: string;
    data: IReview;
}

export interface IUpdateReviewResponse {
    status: number;
    message: string;
    data: IReview;
}

export interface IDeleteReviewResponse {
    status: number;
    message: string;
}
