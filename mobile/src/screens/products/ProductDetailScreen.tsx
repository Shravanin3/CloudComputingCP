
import React from 'react';
import { View, Text, Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppButton } from '../../components/common/AppButton';
import { deleteProduct } from '../../services/products/productService';
import { ROUTES } from '../../constants/routes';

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const product = route.params?.product;

  return (
    <ScreenContainer>
      <Text style={{fontSize: 20}}>{product?.name}</Text>
      <Text>Price: ₹{product?.price}</Text>
      <AppButton title="Edit Product" onPress={() => navigation.navigate(ROUTES.EDIT_PRODUCT, { product })} />
      <AppButton title="Deactivate Product" onPress={() => {
        Alert.alert('Deactivate', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Deactivate', onPress: async () => { await deleteProduct(product.id); navigation.goBack(); } }
        ]);
      }} />
    </ScreenContainer>
  );
};
