import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Tenant } from '../types/auth';
import { secureStorage } from '../utils/secureStorage';
import { getCurrentUser } from '../services/auth/authService';

export interface AuthState {
  token: string | null;
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

export interface AuthContextType {
  authState: AuthState;
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (token: string, user: User, tenant?: Tenant) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    user: null,
    tenant: null,
    isAuthenticated: false,
    isInitializing: true,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await secureStorage.getToken();
        if (token) {
          const res = await getCurrentUser();
          setAuthState({
            token,
            user: res.user,
            tenant: res.tenant,
            isAuthenticated: true,
            isInitializing: false,
          });
        } else {
          setAuthState(prev => ({ ...prev, isInitializing: false }));
        }
      } catch (error) {
        setAuthState(prev => ({ ...prev, isInitializing: false }));
      }
    };
    initializeAuth();
  }, []);

  const login = async (token: string, user: User, tenant?: Tenant) => {
    await secureStorage.setToken(token);
    setAuthState({
      token,
      user,
      tenant: tenant || null,
      isAuthenticated: true,
      isInitializing: false,
    });
  };

  const logout = async () => {
    await secureStorage.removeToken();
    setAuthState({
      token: null,
      user: null,
      tenant: null,
      isAuthenticated: false,
      isInitializing: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        user: authState.user,
        tenant: authState.tenant,
        isAuthenticated: authState.isAuthenticated,
        isInitializing: authState.isInitializing,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
