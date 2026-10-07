import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { useAuth } from '../../navigation/AuthContext';

export const SettingsScreen = () => {
  const { user, tenant, logout } = useAuth();

  return (
    <ScreenContainer>
      <AppCard>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.item}>Name: {user?.name || 'Unknown'}</Text>
        <Text style={styles.item}>Email: {user?.email || 'N/A'}</Text>
        <Text style={styles.item}>Role: {user?.role || 'N/A'}</Text>
        {tenant?.shopName && <Text style={styles.item}>Shop: {tenant.shopName}</Text>}
        {tenant?.gstinNumber && <Text style={styles.item}>GSTIN: {tenant.gstinNumber}</Text>}
      </AppCard>

      <AppButton title="Logout" onPress={logout} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  item: { fontSize: 16, marginBottom: 8, color: '#333' },
});
