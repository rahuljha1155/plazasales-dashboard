import { api } from "./api";

export interface LoginAttempt {
  _id: string;
  email: string;
  ip: string;
  userAgent: string;
  status: "success" | "failed";
  timestamp: string;
}

export interface LoginStatsData {
  total: number;
  success: number;
  failed: number;
  recent: LoginAttempt[];
}

export interface LoginStatsResponse {
  status: number;
  message: string;
  data: {
    records: LoginStatsData;
  };
}

export interface VisitorRecordResponse {
  status: number;
  message: string;
  data: {
    records: VisitorRecord[];
  };
}

export interface VisitorRecord {
  id: string;
  createdAt: string;    // ISO Date string
  userId: string | null;
  ip: string;
  country: string | null;
  city: string | null;
  region: string | null;
  os: string | null;
  browser: string | null;
  device: string | null;
}



export async function fetchLoginStats(): Promise<LoginStatsResponse> {
  const res = await api.get("/analytics/user/recent");
  return res.data;
}