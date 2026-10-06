import React from 'react'; import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native'; import { colors } from '../../constants/colors';
export const ScreenContainer = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => (
  <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>
);
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background } });