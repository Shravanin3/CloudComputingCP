import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
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
