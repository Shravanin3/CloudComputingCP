import React from 'react'; import { View, Text, StyleSheet } from 'react-native'; import { colors } from '../../constants/colors';
export const EmptyState = ({ message = 'No data found.' }: { message?: string }) => (
  <View style={styles.container}><Text style={styles.text}>{message}</Text></View>
);
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }, text: { color: colors.textSecondary, textAlign: 'center' } });