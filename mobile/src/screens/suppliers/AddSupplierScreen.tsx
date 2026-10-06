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
    if (!name) return Alert.alert('Error', 'Name is required.');
    setLoading(true);
    try {
      await createSupplier({ name, phone, payableBalance: 0 });
      navigation.goBack();
    } catch (e: any) { Alert.alert('Error', e.message); } finally { setLoading(false); }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppInput label="Name" value={name} onChangeText={setName} />
      <AppInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <AppButton title={loading ? "Saving..." : "Save Supplier"} onPress={handleSave} disabled={loading} />
    </ScreenContainer>
  );
};