import React from 'react'; import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'; import { colors } from '../../constants/colors';
export const LoadingState = ({ message = 'Loading...' }: { message?: string }) => (
  <View style={styles.container}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.text}>{message}</Text></View>
);
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center' }, text: { marginTop: 8, color: colors.textSecondary } });