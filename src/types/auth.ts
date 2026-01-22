export interface User {
  id: string;
  name: string;
  email: string;
  // Add other user properties as needed
}

export interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export interface AuthResponse {
  token: string;
  user: User;
}
