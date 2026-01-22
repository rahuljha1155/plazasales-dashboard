// Base entity
export interface ICareer {
  id: string;
  title: string;
  slug: string | null;
  location?: string | null;
  department?: string | null;
  jobType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE' | string;
  description?: {
    overview: string;
    responsibilities: string[];
  } | null;
  requirements?: string | null;
  responsibilities?: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  isActive?: boolean;
  isOpen?: boolean;
  createdAt: string;
  updatedAt: string;
  salaryRange?: string;
  sortOrder?: number;
  openDate?: string;
  expiryDate?: string;
}


// Create
export interface ICreateCareerRequest {
  title: string;
  slug?: string;
  location?: string;
  department?: string;
  jobType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE' | string;
  description?: {
    overview: string;
    responsibilities: string[];
  };
  requirements?: string;
  salaryRange?: string;
  isOpen?: boolean;
  openDate?: string;
  expiryDate?: string;
}

export interface ICreateCareerResponse {
  message?: string;
  data: ICareer;
}

// Get all (list)
export interface IGetAllCareersQuery {
  search?: string;
  department?: string;
  location?: string;
  type?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string; // e.g., 'createdAt'
  sortOrder?: 'asc' | 'desc';
}

export interface IGetAllCareersResponse {
  data: {
    careers: ICareer[]
  }
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}


// Get by id
export interface IGetCareerByIdResponse {
  status: number;
  message: string;
  career: ICareer;
}

// Update
export interface IUpdateCareerRequest {
  title?: string;
  slug?: string;
  location?: string;
  department?: string;
  jobType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE' | string;
  description?: {
    overview: string;
    responsibilities: string[];
  };
  requirements?: string;
  salaryRange?: string;
  isOpen?: boolean;
  openDate?: string;
  expiryDate?: string;
}

export interface IUpdateCareerResponse {
  message?: string;
  data: ICareer;
}

// Delete
export interface IDeleteCareerResponse {
  message?: string;
  success: boolean;
  // optionally return the deleted entity
  data?: ICareer;
}