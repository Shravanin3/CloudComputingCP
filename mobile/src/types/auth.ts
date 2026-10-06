export interface User {
  id: string;
  name: string;
  email: string;
  shopName?: string;
  role?: string;
  // TODO: Confirm exact fields with backend
}

export interface AuthState {
  isInitializing: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  // TODO: Confirm exact token field name from backend
}
