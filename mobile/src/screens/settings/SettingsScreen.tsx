import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { useAuth } from '../../navigation/AuthContext';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../constants/colors';

export const SettingsScreen = ({ navigation }: any) => {
  const { user, tenant, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to end your session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* User & Shop Hero Card */}
        <AppCard style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(tenant?.shopName || user?.name || 'M').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.shopName}>{tenant?.shopName || 'MSME Retail Store'}</Text>
              <Text style={styles.ownerName}>
                👤 {user?.name || 'Owner'} • <Text style={styles.roleBadge}>{user?.role || 'ADMIN'}</Text>
              </Text>
              <Text style={styles.emailText}>✉️ {user?.email || 'N/A'}</Text>
            </View>
          </View>

          {tenant?.gstinNumber ? (
            <View style={styles.gstinBox}>
              <Text style={styles.gstinLabel}>Registered GSTIN</Text>
              <Text style={styles.gstinValue}>{tenant.gstinNumber}</Text>
            </View>
          ) : null}
        </AppCard>

        {/* Database & Cloud Architecture Card */}
        <AppCard style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Cloud Infrastructure & Security</Text>

          <View style={styles.techRow}>
            <Text style={styles.techKey}>Database Engine</Text>
            <View style={styles.techBadge}>
              <Text style={styles.techBadgeText}>PostgreSQL 18</Text>
            </View>
          </View>

          <View style={styles.techRow}>
            <Text style={styles.techKey}>Multi-Tenant Isolation</Text>
            <View style={[styles.techBadge, { backgroundColor: colors.successBg }]}>
              <Text style={[styles.techBadgeText, { color: colors.success }]}>RLS Kernel Active</Text>
            </View>
          </View>

          <View style={styles.techRow}>
            <Text style={styles.techKey}>API Gateway</Text>
            <Text style={styles.techValue}>Express REST v1</Text>
          </View>

          <View style={styles.techRow}>
            <Text style={styles.techKey}>Tenant ID</Text>
            <Text style={styles.techValue}>{tenant?.id ? `#${tenant.id.slice(0, 10)}...` : 'Default'}</Text>
          </View>
        </AppCard>

        {/* Quick Operations Navigation */}
        <AppCard style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Quick Navigation</Text>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => navigation.navigate(ROUTES.NEW_BILL)}
          >
            <Text style={styles.navRowTitle}>⚡ Point of Sale (New Bill)</Text>
            <Text style={styles.navRowChevron}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => navigation.navigate(ROUTES.REPORTS)}
          >
            <Text style={styles.navRowTitle}>📊 Financial Reports (P&L Analysis)</Text>
            <Text style={styles.navRowChevron}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navRow}
            onPress={() => navigation.navigate(ROUTES.INVENTORY)}
          >
            <Text style={styles.navRowTitle}>📦 Inventory Stock Management</Text>
            <Text style={styles.navRowChevron}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navRow, { borderBottomWidth: 0 }]}
            onPress={() => navigation.navigate(ROUTES.CUSTOMERS)}
          >
            <Text style={styles.navRowTitle}>👥 Customer Khata & Udhaar Ledger</Text>
            <Text style={styles.navRowChevron}>→</Text>
          </TouchableOpacity>
        </AppCard>

        {/* App Version Info */}
        <View style={styles.appInfoContainer}>
          <Text style={styles.appInfoTitle}>MSME FinTech ERP • Cloud Computing</Text>
          <Text style={styles.appInfoSubtitle}>Version 1.0.0 • Production Build</Text>
        </View>

        {/* Logout Button */}
        <View style={{ marginTop: 12 }}>
          <AppButton
            title="Sign Out from Device"
            variant="danger"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    padding: 16,
    marginBottom: 12,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textWhite,
  },
  shopName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  ownerName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    color: colors.primary,
    fontWeight: '700',
  },
  emailText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  gstinBox: {
    marginTop: 14,
    padding: 10,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gstinLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  gstinValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: 'monospace',
  },
  sectionCard: {
    padding: 16,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
  },
  techKey: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  techValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  techBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  techBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
  },
  navRowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  navRowChevron: {
    fontSize: 16,
    color: colors.textMuted,
  },
  appInfoContainer: {
    alignItems: 'center',
    marginVertical: 14,
  },
  appInfoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  appInfoSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
