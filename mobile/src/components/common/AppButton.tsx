import React from 'react'; import { TouchableOpacity, Text, StyleSheet } from 'react-native'; import { colors } from '../../constants/colors'; import { spacing } from '../../constants/spacing';
export const AppButton = ({ title, onPress, disabled }: { title: string, onPress: () => void, disabled?: boolean }) => (
  <TouchableOpacity style={[styles.button, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);
const styles = StyleSheet.create({ button: { backgroundColor: colors.primary, padding: spacing.m, borderRadius: 8, alignItems: 'center' }, disabled: { opacity: 0.5 }, text: { color: colors.surface, fontWeight: 'bold' } });