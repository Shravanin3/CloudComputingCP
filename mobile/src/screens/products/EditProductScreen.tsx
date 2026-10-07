import React, { useState } from 'react';
import { Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { updateProduct } from '../../services/products/productService';
import { useNavigation, useRoute } from '@react-navigation/native';

export const EditProductScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const product = route.params?.product;

  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.sellingPrice?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !price) { Alert.alert('Error', 'Name and Selling Price are required.'); return; }
    setLoading(true);
    try {
      await updateProduct(product.id, { name, sellingPrice: Number(price) });
      Alert.alert('Success', 'Product updated successfully.');
      navigation.goBack();
    } catch (e: any) { Alert.alert('Error', e.message); } finally { setLoading(false); }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppInput label="Name" value={name} onChangeText={setName} />
      <AppInput label="Selling Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <AppButton title={loading ? "Saving..." : "Update Product"} onPress={handleSave} disabled={loading} />
    </ScreenContainer>
  );
};