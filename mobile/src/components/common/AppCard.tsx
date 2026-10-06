import React from 'react'; import { View, StyleSheet, ViewStyle } from 'react-native'; import { colors } from '../../constants/colors'; import { spacing } from '../../constants/spacing';
export const AppCard = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => (
  <View style={[styles.card, style]}>{children}</View>
);
const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.m, marginBottom: spacing.m, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 } });