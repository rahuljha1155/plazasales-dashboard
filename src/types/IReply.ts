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

// Core Reply model
export type IReplyType = "contact" | "inquiry" | "job_application" | string;

export interface IReply {
  id: string;                 // UUID
  type: IReplyType;           // which flow this reply belongs to
  toId?: string;              // ID of related entity (contact/inquiry/application)
  toEmail?: string;           // optional email target
  subject?: string;
  message: string;
  attachments?: string[];     // URLs or identifiers
  sentBy?: string;            // user/admin ID
  status?: "queued" | "sent" | "failed" | string;
  createdAt?: string;         // ISO date
  updatedAt?: string;         // ISO date
  [key: string]: any;         // backend extensions
}

/**
 * POST /reply/create-reply
 * Used by: create reply for job application | inquiry | contact
 * Different UI actions can set different type and toId/toEmail.
 */
export interface ICreateReplyRequest {
  type: IReplyType;           // "contact" | "inquiry" | "job_application"
  toId?: string;              // related entity id (if applicable)
  toEmail?: string;           // direct email (if applicable)
  subject?: string;
  message: string;
  attachments?: string[];
  sentBy?: string;
}

export interface ICreateReplyResponse {
  success: boolean;
  data: IReply;
  meta?: IApiResponseMeta;
  error?: IApiError;
}

/**
 * GET /reply/get-all-replies
 */
export interface IGetAllRepliesQuery {
  type?: IReplyType;
  toId?: string;
  status?: "queued" | "sent" | "failed" | string;
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

export interface IGetAllRepliesResponse {
  success: boolean;
  data: IReply[];
  meta?: IApiResponseMeta;
  error?: IApiError;
}

/**
 * GET /reply/get-reply/:id
 */
export interface IGetReplyByIdPath {
  id: string;
}

export interface IGetReplyByIdResponse {
  success: boolean;
  data: IReply | null;
  error?: IApiError;
}

/**
 * PUT /reply/update-reply/:id
 */
export interface IUpdateReplyPath {
  id: string;
}

export interface IUpdateReplyRequest {
  subject?: string;
  message?: string;
  attachments?: string[];
  status?: "queued" | "sent" | "failed" | string;
}

export interface IUpdateReplyResponse {
  success: boolean;
  data: IReply;
  error?: IApiError;
}

/**
 * DELETE /reply/delete-reply/:id
 */
export interface IDeleteReplyPath {
  id: string;
}

export interface IDeleteReplyResponse {
  success: boolean;
  data?: { id: string };
  error?: IApiError;
}