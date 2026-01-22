import type { AxiosRequestConfig } from "axios";
import { api } from "./api";

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await api.request<T>(config);
    return response.data;
  } catch (error: { message?: string } | unknown) {
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? (error as { message?: string }).message || "Something went wrong"
        : "Something went wrong";
    throw new Error(message);
  }
}
