import React, { useState } from 'react';
import { Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { createProduct } from '../../services/products/productService';

export const AddProductScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !price) { Alert.alert('Error', 'Name and Selling Price are required.'); return; }
    setLoading(true);
    try {
      await createProduct({ name, sku, price: Number(price), categoryId: 'General' });
      Alert.alert('Success', 'Product added successfully.');
      navigation.goBack();
    } catch (e: any) { Alert.alert('Error', e.message); } finally { setLoading(false); }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppInput label="Name" value={name} onChangeText={setName} />
      <AppInput label="SKU" value={sku} onChangeText={setSku} />
      <AppInput label="Selling Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <AppInput label="Cost Price" value={cost} onChangeText={setCost} keyboardType="numeric" />
      <AppButton title={loading ? "Saving..." : "Save Product"} onPress={handleSave} disabled={loading} />
    </ScreenContainer>
  );
};
