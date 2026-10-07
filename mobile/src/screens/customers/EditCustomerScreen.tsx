import React, { useState } from 'react';
import { Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { updateCustomer } from '../../services/customers/customerService';
import { useNavigation, useRoute } from '@react-navigation/native';

export const EditCustomerScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const customer = route.params?.customer;

  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Name is required.');
    if (!phone.trim() || phone.trim().length < 10) {
      return Alert.alert('Error', 'Valid 10-digit phone number is required.');
    }
    setLoading(true);
    try {
      await updateCustomer(customer.id, { name: name.trim(), phone: phone.trim() });
      Alert.alert('Success', 'Customer updated successfully.');
      navigation.goBack();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to update customer';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppInput label="Name" value={name} onChangeText={setName} />
      <AppInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <AppButton title={loading ? 'Saving...' : 'Update Customer'} onPress={handleSave} disabled={loading} />
    </ScreenContainer>
  );
};