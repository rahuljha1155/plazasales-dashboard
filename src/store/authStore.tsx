import { create } from "zustand";
import axios, { AxiosError } from "axios";
import type { AuthResponse, AuthStore, User } from "@/types/auth";

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await axios.post<AuthResponse>("/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      set({
        error: axiosError.response?.data.message || "Login failed",
        isLoading: false,
      });
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const { data } = await axios.get<User>("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        set({ user: data, isAuthenticated: true });
      }
    } catch (error: unknown) {
      localStorage.removeItem("token");
      set({
        user: null,
        isAuthenticated: false,
        error:
          error && typeof error === "object" && "message" in error
            ? (error as { message: string }).message
            : "Authentication check failed",
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default useAuthStore;
