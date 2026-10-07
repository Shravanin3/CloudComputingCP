import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../navigation/AuthContext';
import { loginApi } from '../../services/auth/authService';
import { colors } from '../../constants/colors';

export const LoginScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('ramesh@ganeshkirana.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (overrideEmail?: string, overridePass?: string) => {
    const loginEmail = (overrideEmail || email).trim();
    const loginPass = (overridePass || password).trim();

    if (!loginEmail || !loginPass) {
      Alert.alert('Missing Fields', 'Please enter both your email address and password.');
      return;
    }
    setLoading(true);
    try {
      const { token, user, tenant } = await loginApi(loginEmail, loginPass);
      await login(token, user, tenant);
    } catch (error: any) {
      console.log('Login error:', error?.message);
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.userMessage ||
        'Unable to connect to the backend or invalid credentials. Ensure backend is running.';
      Alert.alert('Authentication Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    handleLogin(demoEmail, demoPass);
  };

  return (
    <ScreenContainer style={{ padding: 20, justifyContent: 'center' }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Branding Hero */}
        <View style={styles.brandHero}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🏪</Text>
          </View>
          <Text style={styles.brandTitle}>MSME Vyapar ERP</Text>
          <Text style={styles.brandTagline}>Cloud POS, Smart Inventory & Khata Ledger</Text>
        </View>

        {/* Login Card */}
        <AppCard style={styles.card}>
          <Text style={styles.cardHeading}>Sign In to Your Store</Text>

          <AppInput
            label="Email Address"
            placeholder="ramesh@ganeshkirana.com"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <AppInput
            label="Password"
            placeholder="password123"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <View style={{ marginTop: 14 }}>
            <AppButton
              title="Sign In"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={() => handleLogin()}
            />
          </View>

          {/* Quick Demo Credentials */}
          <Text style={styles.demoLabel}>1-Click Quick Demo Login:</Text>
          <View style={styles.demoRow}>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleQuickDemo('ramesh@ganeshkirana.com', 'password123')}
              disabled={loading}
            >
              <Text style={styles.demoBtnText}>👑 Store Owner</Text>
              <Text style={styles.demoBtnSub}>Ramesh Patil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleQuickDemo('suresh@ganeshkirana.com', 'password123')}
              disabled={loading}
            >
              <Text style={styles.demoBtnText}>⚡ Cashier Staff</Text>
              <Text style={styles.demoBtnSub}>Suresh More</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate(ROUTES.AUTH_REGISTER)}
            disabled={loading}
          >
            <Text style={styles.registerLinkText}>
              New business? <Text style={styles.registerLinkBold}>Register Shop</Text>
            </Text>
          </TouchableOpacity>
        </AppCard>

        {/* Security Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔒 Secured with PostgreSQL 18 Multi-Tenant RLS & JWT Auth
          </Text>
        </View>
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
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoIcon: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    padding: 22,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  demoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  demoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  demoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  demoBtnSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderLight,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  registerLinkText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  registerLinkBold: {
    color: colors.primary,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
