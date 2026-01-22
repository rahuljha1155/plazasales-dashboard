import { api } from "./api";

export interface UserAnalyticsRecord {
    id: string;
    createdAt: string;
    userId: string | null;
    ip: string;
    country: string;
    city: string | null;
    region: string | null;
    os: string;
    browser: string;
    device: string;
}

export interface RecentUserAnalyticsResponse {
    status: number;
    message: string;
    data: {
        records: UserAnalyticsRecord[];
    };
}

export async function fetchRecentUserAnalytics() {
    const response = await api.get<RecentUserAnalyticsResponse>("/analytics/user/recent");
    return response;
}
