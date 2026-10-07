import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { ROUTES } from '../../constants/routes';
import { registerApi } from '../../services/auth/authService';

export const RegisterScreen = ({ navigation }: any) => {
  const [shopName, setShopName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!shopName || !name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'All required fields must be filled.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await registerApi({ shopName, name, email, password });
      Alert.alert('Success', 'Registration successful. Please login.', [
        { text: 'OK', onPress: () => navigation.navigate(ROUTES.AUTH_LOGIN) },
      ]);
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.userMessage ||
        error?.message ||
        'Registration failed.';
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>
          Register Shop & Owner
        </Text>
        <AppInput label="Shop Name" placeholder="e.g. Ganesh Kirana Store" value={shopName} onChangeText={setShopName} />
        <AppInput label="Owner Name" placeholder="e.g. Ramesh Patil" value={name} onChangeText={setName} />
        <AppInput
          label="Email"
          placeholder="owner@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <AppInput label="Password" placeholder="Minimum 6 characters" secureTextEntry value={password} onChangeText={setPassword} />
        <AppInput label="Confirm Password" placeholder="Re-enter password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
        <AppButton title={loading ? 'Registering...' : 'Register'} onPress={handleRegister} disabled={loading} />
        <View style={{ marginTop: 16 }}>
          <AppButton title="Back to Login" onPress={() => navigation.goBack()} disabled={loading} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};
