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
  const [stock, setStock] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !price) {
      Alert.alert('Error', 'Name and Selling Price are required.');
      return;
    }
    const sellingPriceNum = Number(price);
    const costPriceNum = cost ? Number(cost) : sellingPriceNum * 0.8;
    const initialStockNum = parseInt(stock, 10) || 0;

    setLoading(true);
    try {
      await createProduct({
        name,
        sku: sku.trim() || undefined,
        sellingPrice: sellingPriceNum,
        costPrice: costPriceNum,
        initialStock: initialStockNum,
      } as any);
      Alert.alert('Success', 'Product added successfully.');
      navigation.goBack();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to add product';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppInput label="Name" placeholder="Product name" value={name} onChangeText={setName} />
      <AppInput label="SKU (Optional)" placeholder="e.g. BAR-001" value={sku} onChangeText={setSku} />
      <AppInput label="Selling Price (₹)" placeholder="0.00" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <AppInput label="Cost Price (₹)" placeholder="Optional" value={cost} onChangeText={setCost} keyboardType="numeric" />
      <AppInput label="Initial Stock" placeholder="0" value={stock} onChangeText={setStock} keyboardType="numeric" />
      <AppButton title={loading ? 'Saving...' : 'Save Product'} onPress={handleSave} disabled={loading} />
    </ScreenContainer>
  );
};
