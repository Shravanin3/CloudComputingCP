import React from 'react'; import { TextInput, StyleSheet, TextInputProps, View, Text } from 'react-native'; import { colors } from '../../constants/colors'; import { spacing } from '../../constants/spacing';
interface Props extends TextInputProps { label?: string; error?: string; }
export const AppInput = ({ label, error, ...props }: Props) => (
  <View style={styles.container}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput style={styles.input} placeholderTextColor={colors.textSecondary} {...props} />
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);
const styles = StyleSheet.create({ container: { marginBottom: spacing.m }, label: { color: colors.textPrimary, marginBottom: spacing.xs }, input: { borderWidth: 1, borderColor: colors.border, padding: spacing.m, borderRadius: 8, color: colors.textPrimary }, error: { color: colors.error, fontSize: 12, marginTop: spacing.xs } });