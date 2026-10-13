import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { ROUTES } from '../../constants/routes';
import { registerApi, loginApi } from '../../services/auth/authService';
import { useAuth } from '../../navigation/AuthContext';
import { colors } from '../../constants/colors';

export const RegisterScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const [shopName, setShopName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!shopName.trim() || !name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('All fields are required to register your business.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('The passwords you entered do not match.');
      return;
    }

    setLoading(true);
    try {
      const regResult = await registerApi({
        shopName: shopName.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setSuccessMessage(`Store "${shopName}" registered successfully!`);

      // If backend returned token & user (auto-login support)
      if (regResult?.token && regResult?.user) {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert(`🎉 Registration Successful!\n\nStore: ${shopName}\nOwner: ${name}\n\nEntering store dashboard now...`);
        }
        await login(regResult.token, regResult.user, regResult.tenant);
        return;
      }

      // Fallback: log in with the new credentials directly
      try {
        const { token, user, tenant } = await loginApi(email.trim().toLowerCase(), password);
        await login(token, user, tenant);
        return;
      } catch (_) {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert(`Registration Successful! Please sign in with your email and password.`);
        } else {
          Alert.alert('Registration Successful', 'Please sign in with your new credentials.');
        }
        navigation.navigate(ROUTES.AUTH_LOGIN);
      }
    } catch (error: any) {
      console.log('Register error:', error);
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.userMessage ||
        error?.message ||
        'Registration failed. Please ensure the backend is running.';
      setErrorMessage(msg);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert(`Registration Failed: ${msg}`);
      } else {
        Alert.alert('Registration Failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 20 }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandHero}>
          <Text style={styles.brandTitle}>Register Your Business</Text>
          <Text style={styles.brandTagline}>
            Set up your cloud multi-tenant workspace in seconds
          </Text>
        </View>

        {/* Form Card */}
        <AppCard style={styles.card}>
          {/* Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          {/* Success Banner */}
          {successMessage ? (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✓ {successMessage}</Text>
            </View>
          ) : null}

          <AppInput
            label="Shop / Business Name *"
            placeholder="e.g. Ganesh Supermarket"
            value={shopName}
            onChangeText={(txt) => {
              setShopName(txt);
              setErrorMessage('');
            }}
          />

          <AppInput
            label="Owner Full Name *"
            placeholder="e.g. Ramesh Patil"
            value={name}
            onChangeText={(txt) => {
              setName(txt);
              setErrorMessage('');
            }}
          />

          <AppInput
            label="Work Email Address *"
            placeholder="owner@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(txt) => {
              setEmail(txt);
              setErrorMessage('');
            }}
          />

          <AppInput
            label="Password (min 6 characters) *"
            placeholder="Choose a strong password"
            secureTextEntry
            value={password}
            onChangeText={(txt) => {
              setPassword(txt);
              setErrorMessage('');
            }}
          />

          <AppInput
            label="Confirm Password *"
            placeholder="Re-enter password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(txt) => {
              setConfirmPassword(txt);
              setErrorMessage('');
            }}
          />

          <View style={{ marginTop: 14 }}>
            <AppButton
              title={loading ? 'Creating Store Account...' : 'Create Store Account'}
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleRegister}
            />
          </View>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate(ROUTES.AUTH_LOGIN)}
            disabled={loading}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </AppCard>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  brandTagline: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    padding: 22,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  successBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  successText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '700',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  loginLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loginLinkBold: {
    color: colors.primary,
    fontWeight: '700',
  },
});
