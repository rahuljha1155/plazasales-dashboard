import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  _id?: string;
  id?: string;
  email: string;
  isVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  firstname?: string;
  middlename?: string | null;
  lastname?: string;
  name?: string;
  phone?: string;
  gender?: string;
  address?: string;
  profilePicture?: string | null;
  sortOrder?: number;
  createdBy?: string | null;
  __v?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;

  saveInfo: (data: { user: User }) => void;
  getInfo: () => { user: User | null };
  logout: () => void;
}

export const useUserStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,

      saveInfo: ({ user }) => {
        set({
          user,
          isAuthenticated: true,
        });
      },

      getInfo: () => {
        const { user } = get();
        return { user };
      },

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
