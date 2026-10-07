import React, { useState } from 'react';
import { Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { createSupplier } from '../../services/suppliers/supplierService';

export const AddSupplierScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Supplier name is required.');
      return;
    }
    setLoading(true);
    try {
      await createSupplier({
        name: name.trim(),
        phone: phone.trim() || undefined,
        payableBalance: 0,
      });
      Alert.alert('Success', 'Supplier added successfully.');
      navigation.goBack();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to save supplier';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppInput label="Supplier Name" placeholder="e.g. Mahavir Wholesalers" value={name} onChangeText={setName} />
      <AppInput label="Phone (Optional)" placeholder="e.g. 9876543210" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <AppButton title={loading ? 'Saving...' : 'Save Supplier'} onPress={handleSave} disabled={loading} />
    </ScreenContainer>
  );
};