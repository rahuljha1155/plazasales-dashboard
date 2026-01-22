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

// Core Team Member model
export interface ITeamMember {
  id: string
  _id?: string
  createdAt: string
  updatedAt: string
  sortOrder: number
  isDeleted: boolean
  addToHome: boolean
  fullname: string
  name: string
  designation: string
  image: string
  cvImage?: string
  gallery?: string[]
  countryCode: string
  phoneNumber: string
  facebook: string
  twitter: string
  linkedin: string
  instagram: string
  memberType?: string
  description?: string
  members?: ITeamMember[]
}

/**
 * POST /team/create-member
 */
export interface ICreateTeamMemberRequest {
  name: string;
  email: string;
  role?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface ICreateTeamMemberResponse {
  success: boolean;
  data: ITeamMember;
  meta?: IApiResponseMeta;
  error?: IApiError;
}



export interface IMember {
  id: string;
  createdAt: string;
  updatedAt: string;
  sortOrder: number;
  addToHome: boolean;
  fullname: string;
  designation: string;
  image: string;
  countryCode: string;
  phoneNumber: string;
  isLeader?: boolean;
  description?: {
    text: string;
  };
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
}

export interface MembersResponse {
  status: number;
  data: {
    members: IMember[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}


/**
 * GET /team/get-all-members
 */
export interface IGetAllTeamMembersResponse {
  status: number;
  data: {
    members: IMember[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * GET /team/get-member/:id
 */
export interface IGetTeamMemberByIdPath {
  id: string;
}

export interface IGetTeamMemberByIdResponse {
  success: boolean;
  data: ITeamMember | null;
  error?: IApiError;
}

/**
 * PUT /team/update-member/:id
 */
export interface IUpdateTeamMemberRequest {
  name?: string;
  email?: string;
  role?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

export interface IUpdateTeamMemberResponse {
  success: boolean;
  data: ITeamMember;
  error?: IApiError;
}

/**
 * DELETE /team/delete-member/:id
 */
export interface IDeleteTeamMemberResponse {
  success: boolean;
  data?: { id: string };
  error?: IApiError;
}

// Deleted Members types
export interface IDeletedMember {
  id: string;
  createdAt: string;
  updatedAt: string;
  fullname: string;
  name: string;
  designation: string;
  image: string;
  countryCode: string;
  phoneNumber: string;
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
  deletedAt: string;
}

export interface IDeletedMembersResponse {
  status: number;
  data: {
    members: IDeletedMember[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IRecoverMembersResponse {
  status: number;
  message: string;
  data: {
    recoveredCount: number;
  };
}