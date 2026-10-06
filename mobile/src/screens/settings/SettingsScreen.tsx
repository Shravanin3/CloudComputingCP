import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { useAuth } from '../../navigation/AuthContext';

export const SettingsScreen = () => {
  const { user, logout } = useAuth();

  return (
    <ScreenContainer>
      <AppCard>
        <Text style={styles.title}>Profile</Text>
        <Text>Name: {user?.name || 'Unknown'}</Text>
        <Text>Email: {user?.email}</Text>
        <Text>Role: {user?.role}</Text>
      </AppCard>

      <AppButton title="Logout" onPress={logout} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});
