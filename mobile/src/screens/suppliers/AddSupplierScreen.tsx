import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { createSupplier } from '../../services/suppliers/supplierService';
import { colors } from '../../constants/colors';

export const AddSupplierScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [initialDebt, setInitialDebt] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Supplier / Vendor name is required.');
      return;
    }

    setLoading(true);
    try {
      await createSupplier({
        name: name.trim(),
        phone: phone.trim() || undefined,
        payableBalance: Number(initialDebt) || 0,
      });
      Alert.alert('Success', `Supplier "${name}" has been registered in Accounts Payable.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to save supplier';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <AppCard style={styles.card}>
          <Text style={styles.heading}>Register Vendor / Supplier</Text>
          <Text style={styles.subheading}>
            Add wholesale vendors to keep track of purchase invoices, credits, and payable debts.
          </Text>

          <AppInput
            label="Supplier / Firm Name *"
            placeholder="e.g. Mahavir Wholesalers & Distributors"
            value={name}
            onChangeText={setName}
          />

          <AppInput
            label="Phone Number (Optional)"
            placeholder="e.g. 9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <AppInput
            label="Opening Payable Debt (₹)"
            placeholder="0"
            value={initialDebt}
            onChangeText={setInitialDebt}
            keyboardType="numeric"
          />

          <View style={{ marginTop: 12 }}>
            <AppButton
              title="Save Supplier"
              variant="primary"
              loading={loading}
              onPress={handleSave}
            />
          </View>

          <View style={{ marginTop: 8 }}>
            <AppButton
              title="Cancel"
              variant="subtle"
              onPress={() => navigation.goBack()}
              disabled={loading}
            />
          </View>
        </AppCard>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subheading: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
});