import { api } from "./api";

export interface ICreateContactReplyRequest {
  message: string;
  contactId: string;
}

export interface ICreateApplicationReplyRequest {
  message: string;
  jobApplicationId: string;
}

export interface ICreateReplyResponse {
  status: number;
  message: string;
}

export async function createContactReply(data: ICreateContactReplyRequest): Promise<ICreateReplyResponse> {
  const response = await api.post("/reply/create-reply", data);
  return response.data;
}

export async function createApplicationReply(data: ICreateApplicationReplyRequest): Promise<ICreateReplyResponse> {
  const response = await api.post("/reply/create-reply", data);
  return response.data;
}
