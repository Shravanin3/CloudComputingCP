import React, { useState } from 'react';
import { Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { createCustomer } from '../../services/customers/customerService';

export const AddCustomerScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      Alert.alert('Error', 'Valid 10-digit phone number is required.');
      return;
    }
    setLoading(true);
    try {
      await createCustomer({ name: name.trim(), phone: phone.trim(), creditBalance: 0 });
      Alert.alert('Success', 'Customer added successfully.');
      navigation.goBack();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to save customer';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppInput label="Customer Name" placeholder="e.g. Anand Kumar" value={name} onChangeText={setName} />
      <AppInput label="Phone Number" placeholder="e.g. 9876543210" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <AppButton title={loading ? 'Saving...' : 'Save Customer'} onPress={handleSave} disabled={loading} />
    </ScreenContainer>
  );
};