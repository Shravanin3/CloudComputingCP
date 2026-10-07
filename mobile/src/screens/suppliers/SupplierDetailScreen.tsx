import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { recordPayment } from '../../services/suppliers/supplierService';
import { ROUTES } from '../../constants/routes';

export const SupplierDetailScreen = ({ route, navigation }: any) => {
  const initialSupplier = route.params?.supplier;
  const [supplier, setSupplier] = useState(initialSupplier);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePayment = async () => {
    const amt = Number(paymentAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Error', 'Please enter a valid payment amount.');
      return;
    }
    setSubmitting(true);
    try {
      await recordPayment(supplier.id, { amount: amt, paymentMethod: 'CASH' });
      Alert.alert('Success', `Recorded ₹${amt} payment to ${supplier.name}`);
      setSupplier((prev: any) => ({
        ...prev,
        payableBalance: Math.max(0, (prev.payableBalance || 0) - amt),
      }));
      setPaymentAmount('');
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to record payment';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppCard>
        <Text style={styles.name}>{supplier?.name}</Text>
        <Text style={styles.phone}>Phone: {supplier?.phone}</Text>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Payable Debt:</Text>
          <Text style={styles.balanceValue}>₹{supplier?.payableBalance || 0}</Text>
        </View>
        <AppButton
          title="Edit Details"
          onPress={() => navigation.navigate(ROUTES.EDIT_SUPPLIER, { supplier })}
          style={{ marginTop: 10 }}
        />
      </AppCard>

      <AppCard style={{ marginTop: 16 }}>
        <Text style={styles.sectionTitle}>Pay Supplier</Text>
        <AppInput
          label="Payment Amount (₹)"
          placeholder="e.g. 500"
          value={paymentAmount}
          onChangeText={setPaymentAmount}
          keyboardType="numeric"
        />
        <AppButton
          title={submitting ? 'Recording...' : 'Record Payment'}
          onPress={handlePayment}
          disabled={submitting}
        />
      </AppCard>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  name: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  phone: { fontSize: 15, color: '#666', marginBottom: 12 },
  balanceContainer: {
    padding: 12,
    backgroundColor: '#f8d7da',
    borderRadius: 8,
    marginVertical: 8,
  },
  balanceLabel: { fontSize: 13, color: '#721c24' },
  balanceValue: { fontSize: 22, fontWeight: 'bold', color: '#721c24' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
});
