import os
from pathlib import Path

base_dir = Path(r"d:\projects\clg sem 5\CC\cc_courseproject\mobile")

# 1. Update Auth Types
auth_types_code = """export interface User {
  id: string;
  name: string;
  email: string;
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
"""
(base_dir / "src/types/auth.ts").write_text(auth_types_code, encoding="utf-8")

# 2. Auth Context
auth_context_code = """import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User } from '../../types/auth';
import { secureStorage } from '../../utils/secureStorage';
import { getCurrentUser } from '../../services/auth/authService';
import { apiClient } from '../../services/api/apiClient';

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

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await secureStorage.getToken();
        if (token) {
          // Set interceptor token so GET /me works
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const user = await getCurrentUser();
          setState({ isInitializing: false, isAuthenticated: true, user });
        } else {
          setState({ isInitializing: false, isAuthenticated: false, user: null });
        }
      } catch (error) {
        await secureStorage.removeToken();
        delete apiClient.defaults.headers.common['Authorization'];
        setState({ isInitializing: false, isAuthenticated: false, user: null });
      }
    };
    initAuth();
  }, []);

  const login = async (token: string, user: User) => {
    await secureStorage.setToken(token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setState({ isInitializing: false, isAuthenticated: true, user });
  };

  const logout = async () => {
    await secureStorage.removeToken();
    delete apiClient.defaults.headers.common['Authorization'];
    setState({ isInitializing: false, isAuthenticated: false, user: null });
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
"""
(base_dir / "src/navigation/AuthContext.tsx").write_text(auth_context_code, encoding="utf-8")

# 3. Update RootNavigator
root_nav_code = """import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { useAuth } from './AuthContext';
import { LoadingState } from '../components/common/LoadingState';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { isInitializing, isAuthenticated } = useAuth();

  if (isInitializing) {
    return <LoadingState message="Initializing session..." />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="App" component={AppNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
"""
(base_dir / "src/navigation/RootNavigator.tsx").write_text(root_nav_code, encoding="utf-8")

# 4. App.tsx
app_code = """import React from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/navigation/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
"""
(base_dir / "App.tsx").write_text(app_code, encoding="utf-8")

# 5. Update apiClient interceptors
api_client_code = """import axios from 'axios';
import { secureStorage } from '../../utils/secureStorage';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await secureStorage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // We cannot directly clear context here without circular dependency or events, 
    // but we can throw it so the caller (AuthContext) catches it.
    if (error.response && error.response.status === 401) {
       // A centralized event emitter could be used here to notify AuthContext
       // For now, it rejects and the calling service handles the 401
    }
    return Promise.reject(error);
  }
);
"""
(base_dir / "src/services/api/apiClient.ts").write_text(api_client_code, encoding="utf-8")

# 6. Update authService
auth_service_code = """import { apiClient } from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import { User, LoginResponse } from '../../types/auth';

export const loginApi = async (email: string, password: string): Promise<{token: string, user?: User}> => {
  const res = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
  // TODO: Adjust field names based on exact backend response
  const token = res.data.token || res.data.accessToken; 
  if (!token) throw new Error("No token returned by backend");
  return { token, user: res.data.user };
};

export const registerApi = async (data: any) => {
  const res = await apiClient.post(ENDPOINTS.AUTH.REGISTER, data);
  return res.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const res = await apiClient.get(ENDPOINTS.AUTH.ME);
  return res.data;
};
"""
(base_dir / "src/services/auth/authService.ts").write_text(auth_service_code, encoding="utf-8")

# 7. Update LoginScreen
login_screen_code = """import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../navigation/AuthContext';
import { loginApi, getCurrentUser } from '../../services/auth/authService';

export const LoginScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const { token } = await loginApi(email, password);
      // Fetch user profile
      const user = await getCurrentUser();
      await login(token, user);
      // AuthContext will automatically re-render RootNavigator and go to AppNavigator
    } catch (error: any) {
      console.log('Login error:', error.message);
      Alert.alert('Login Failed', 'Unable to connect to the backend or invalid credentials. Ensure Member 2 backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>MSME FinTech</Text>
      <AppInput label="Email" placeholder="Enter email" keyboardType="email-address" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <AppInput label="Password" placeholder="Enter password" secureTextEntry value={password} onChangeText={setPassword} />
      <AppButton title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
      <View style={{ marginTop: 16 }}>
        <AppButton title="Register" onPress={() => navigation.navigate(ROUTES.AUTH_REGISTER)} disabled={loading} />
      </View>
    </ScreenContainer>
  );
};
"""
(base_dir / "src/screens/auth/LoginScreen.tsx").write_text(login_screen_code, encoding="utf-8")

# 8. Update RegisterScreen
register_screen_code = """import React, { useState } from 'react';
import { Text, Alert, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { ROUTES } from '../../constants/routes';
import { registerApi } from '../../services/auth/authService';

export const RegisterScreen = ({ navigation }: any) => {
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!shopName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await registerApi({ shopName, email, password });
      Alert.alert('Success', 'Registration successful. Please login.', [
        { text: 'OK', onPress: () => navigation.navigate(ROUTES.AUTH_LOGIN) }
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', 'Ensure backend is running. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16, justifyContent: 'center' }}>
      <ScrollView contentContainerStyle={{flexGrow:1, justifyContent:'center'}}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>Register Shop</Text>
        <AppInput label="Shop Name" placeholder="Enter shop name" value={shopName} onChangeText={setShopName} />
        <AppInput label="Email" placeholder="Enter email" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <AppInput label="Password" placeholder="Enter password" secureTextEntry value={password} onChangeText={setPassword} />
        <AppInput label="Confirm Password" placeholder="Confirm password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
        <AppButton title={loading ? 'Registering...' : 'Register'} onPress={handleRegister} disabled={loading} />
        <View style={{ marginTop: 16 }}>
          <AppButton title="Back to Login" onPress={() => navigation.goBack()} disabled={loading} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};
"""
(base_dir / "src/screens/auth/RegisterScreen.tsx").write_text(register_screen_code, encoding="utf-8")

# 9. Update SettingsScreen to use Logout
settings_screen_code = """import React from 'react';
import { Text } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppButton } from '../../components/common/AppButton';
import { useAuth } from '../../navigation/AuthContext';

export const SettingsScreen = () => {
  const { logout, user } = useAuth();

  return (
    <ScreenContainer style={{padding: 16}}>
      <Text style={{fontSize: 24, marginBottom: 16, fontWeight: 'bold'}}>Settings</Text>
      {user && (
        <Text style={{marginBottom: 20}}>Logged in as: {user.email}</Text>
      )}
      <AppButton title="Logout" onPress={logout} />
    </ScreenContainer>
  );
};
"""
(base_dir / "src/screens/settings/SettingsScreen.tsx").write_text(settings_screen_code, encoding="utf-8")

print("Part 2 Architecture applied.")
