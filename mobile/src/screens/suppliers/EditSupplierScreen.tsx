import React, { useState } from 'react';
import { Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { updateSupplier } from '../../services/suppliers/supplierService';
import { useNavigation, useRoute } from '@react-navigation/native';

export const EditSupplierScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const supplier = route.params?.supplier;

  const [name, setName] = useState(supplier?.name || '');
  const [phone, setPhone] = useState(supplier?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Name is required.');
    setLoading(true);
    try {
      await updateSupplier(supplier.id, { name: name.trim(), phone: phone.trim() || undefined });
      Alert.alert('Success', 'Supplier updated successfully.');
      navigation.goBack();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to update supplier';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppInput label="Name" value={name} onChangeText={setName} />
      <AppInput label="Phone (Optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <AppButton title={loading ? 'Saving...' : 'Update Supplier'} onPress={handleSave} disabled={loading} />
    </ScreenContainer>
  );
};