import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { receivePayment } from '../../services/customers/customerService';
import { ROUTES } from '../../constants/routes';

export const CustomerDetailScreen = ({ route, navigation }: any) => {
  const initialCustomer = route.params?.customer;
  const [customer, setCustomer] = useState(initialCustomer);
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
      await receivePayment(customer.id, { amount: amt, paymentMethod: 'CASH' });
      Alert.alert('Success', `Recorded ₹${amt} payment from ${customer.name}`);
      setCustomer((prev: any) => ({
        ...prev,
        creditBalance: Math.max(0, (prev.creditBalance || 0) - amt),
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
        <Text style={styles.name}>{customer?.name}</Text>
        <Text style={styles.phone}>Phone: {customer?.phone}</Text>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Outstanding Balance:</Text>
          <Text style={styles.balanceValue}>₹{customer?.creditBalance || 0}</Text>
        </View>
        <AppButton
          title="Edit Details"
          onPress={() => navigation.navigate(ROUTES.EDIT_CUSTOMER, { customer })}
          style={{ marginTop: 10 }}
        />
      </AppCard>

      <AppCard style={{ marginTop: 16 }}>
        <Text style={styles.sectionTitle}>Receive Payment</Text>
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
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    marginVertical: 8,
  },
  balanceLabel: { fontSize: 13, color: '#856404' },
  balanceValue: { fontSize: 22, fontWeight: 'bold', color: '#856404' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
});
