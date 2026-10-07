import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../navigation/AuthContext';
import { loginApi } from '../../services/auth/authService';

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
      const { token, user, tenant } = await loginApi(email, password);
      await login(token, user, tenant);
      // AuthContext will automatically re-render RootNavigator and go to AppNavigator
    } catch (error: any) {
      console.log('Login error:', error?.message);
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.userMessage ||
        'Unable to connect to the backend or invalid credentials. Ensure backend is running.';
      Alert.alert('Login Failed', msg);
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
