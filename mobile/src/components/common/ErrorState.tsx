import React from 'react'; import { View, Text, StyleSheet } from 'react-native'; import { colors } from '../../constants/colors'; import { AppButton } from './AppButton';
export const ErrorState = ({ message = 'An error occurred.', onRetry }: { message?: string, onRetry?: () => void }) => (
  <View style={styles.container}><Text style={styles.text}>{message}</Text>{onRetry && <AppButton title="Retry" onPress={onRetry} />}</View>
);
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }, text: { color: colors.error, marginBottom: 16, textAlign: 'center' } });