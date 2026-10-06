import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthState, User } from '../types/auth';
import { secureStorage } from '../utils/secureStorage';
import { getCurrentUser } from '../services/auth/authService';
import { apiClient } from '../services/api/apiClient';
import { setUnauthorizedCallback } from '../utils/authEvents';

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    isInitializing: true,
    isAuthenticated: false,
    user: null,
  });

  const logout = useCallback(async () => {
    await secureStorage.removeToken();
    delete apiClient.defaults.headers.common['Authorization'];
    setState({ isInitializing: false, isAuthenticated: false, user: null });
  }, []);

  useEffect(() => {
    setUnauthorizedCallback(() => {
      logout();
    });

    const initAuth = async () => {
      try {
        const token = await secureStorage.getToken();
        if (token) {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const user = await getCurrentUser();
          setState({ isInitializing: false, isAuthenticated: true, user });
        } else {
          setState({ isInitializing: false, isAuthenticated: false, user: null });
        }
      } catch (error: any) {
        // If it's a 401, the interceptor will trigger logout anyway
        // For network errors (like backend down), we don't assume the token is bad
        // But for safe initialization, if we can't verify the user, we should either show an error or clear it.
        // As per project spec: "Do not incorrectly treat every network error as proof that the JWT is invalid."
        if (error.response && error.response.status === 401) {
           await logout();
        } else {
           // Network error. Can't verify session. Show unauthenticated to be safe, but keep token if needed?
           // The prompt says: "Invalid 401 -> token removed + unauth. Backend unavailable -> No infinite loading. The app should finish initialization and show a sensible authentication/network error state or unauthenticated state."
           setState({ isInitializing: false, isAuthenticated: false, user: null });
        }
      }
    };
    initAuth();
  }, [logout]);

  const login = async (token: string, user: User) => {
    await secureStorage.setToken(token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setState({ isInitializing: false, isAuthenticated: true, user });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
