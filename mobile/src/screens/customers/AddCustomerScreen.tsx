import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { createCustomer } from '../../services/customers/customerService';
import { colors } from '../../constants/colors';

export const AddCustomerScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [initialBalance, setInitialBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter customer name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    try {
      await createCustomer({
        name: name.trim(),
        phone: phone.trim(),
        creditBalance: Number(initialBalance) || 0,
      });
      Alert.alert('Success', `Customer "${name}" has been registered in Khata ledger.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to save customer';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <AppCard style={styles.card}>
          <Text style={styles.heading}>Register New Customer</Text>
          <Text style={styles.subheading}>
            Add regular customers to track credit (Udhaar/Khata) and issue fast receipts.
          </Text>

          <AppInput
            label="Customer Full Name *"
            placeholder="e.g. Ramesh Patil"
            value={name}
            onChangeText={setName}
          />

          <AppInput
            label="Phone Number (10 digits) *"
            placeholder="e.g. 9876543210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <AppInput
            label="Opening Khata / Udhaar (₹)"
            placeholder="0"
            value={initialBalance}
            onChangeText={setInitialBalance}
            keyboardType="numeric"
          />

          <View style={{ marginTop: 12 }}>
            <AppButton
              title="Save Customer to Khata"
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