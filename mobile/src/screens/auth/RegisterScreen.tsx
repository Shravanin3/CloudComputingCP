import React, { useState } from 'react';
import { View, Text, Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { ROUTES } from '../../constants/routes';
import { registerApi } from '../../services/auth/authService';
import { colors } from '../../constants/colors';

export const RegisterScreen = ({ navigation }: any) => {
  const [shopName, setShopName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!shopName.trim() || !name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Required Fields', 'All fields are required to register your business.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords you entered do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerApi({
        shopName: shopName.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      Alert.alert(
        'Registration Successful',
        `Store "${shopName}" registered with owner "${name}". You can now sign in!`,
        [{ text: 'Sign In Now', onPress: () => navigation.navigate(ROUTES.AUTH_LOGIN) }]
      );
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
          <AppInput
            label="Shop / Business Name *"
            placeholder="e.g. Ganesh Supermarket"
            value={shopName}
            onChangeText={setShopName}
          />

          <AppInput
            label="Owner Full Name *"
            placeholder="e.g. Ramesh Patil"
            value={name}
            onChangeText={setName}
          />

          <AppInput
            label="Work Email Address *"
            placeholder="owner@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <AppInput
            label="Password (min 6 characters) *"
            placeholder="Choose a strong password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <AppInput
            label="Confirm Password *"
            placeholder="Re-enter password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <View style={{ marginTop: 14 }}>
            <AppButton
              title="Create Store Account"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleRegister}
            />
          </View>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.goBack()}
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
