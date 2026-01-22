// Base entity
export interface IApplication {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  name: string;
  email: string;
  position: string;
  isView: boolean;
  phone: string;
  resumeUrl: string;
  coverLetterUrl: string;
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';
  career: ICareerInApplication | null;
  replies: IApplicationReply[];
}

export interface ICareerInApplication {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  title: string;
  slug: string | null;
  department: string;
  location: string;
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
  description: {
    overview: string;
  };
  requirements: string;
  salaryRange: string;
  isOpen: boolean;
}

export interface IApplicationReply {
  id: string;
  message: string;
  createdAt: string;
}

// Get all applications
export interface IGetAllApplicationsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export interface IGetAllApplicationsResponse {
  status: number;
  data: {
    applications: IApplication[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  cached: boolean;
}

// Get by id
export interface IGetApplicationByIdResponse {
  status: number;
  data: IApplication;
}

// Update
export interface IUpdateApplicationRequest {
  status?: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED';
  isView?: boolean;
}

export interface IUpdateApplicationResponse {
  status: number;
  message: string;
  data: IApplication;
}

// Delete
export interface IDeleteApplicationResponse {
  status: number;
  message: string;
  success: boolean;
}

// Deleted applications
export interface IDeletedApplication extends IApplication {
  deletedAt: string;
}

export interface IGetDeletedApplicationsResponse {
  status: number;
  data: {
    applications: IDeletedApplication[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Recover
export interface IRecoverApplicationsRequest {
  ids: string[];
}

export interface IRecoverApplicationsResponse {
  status: number;
  message: string;
  success: boolean;
}
