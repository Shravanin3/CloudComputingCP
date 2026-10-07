import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { updateProduct } from '../../services/products/productService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../constants/colors';

export const EditProductScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const product = route.params?.product;

  const [name, setName] = useState(product?.name || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [category, setCategory] = useState(product?.category || '');
  const [price, setPrice] = useState(
    product?.sellingPrice?.toString() ?? product?.price?.toString() ?? ''
  );
  const [cost, setCost] = useState(product?.costPrice?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter a product name.');
      return;
    }
    const sellingPriceNum = Number(price);
    if (!sellingPriceNum || sellingPriceNum <= 0) {
      Alert.alert('Required Field', 'Please enter a valid positive selling price.');
      return;
    }

    setLoading(true);
    try {
      await updateProduct(product.id, {
        name: name.trim(),
        sku: sku.trim() || undefined,
        category: category.trim() || undefined,
        sellingPrice: sellingPriceNum,
        costPrice: cost ? Number(cost) : undefined,
      } as any);
      Alert.alert('Success', 'Product updated successfully in catalog.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <AppCard style={styles.card}>
          <Text style={styles.heading}>Edit Product</Text>
          <Text style={styles.subheading}>
            Update pricing, SKU, or categorisation for #{product?.id?.slice(0, 8)}
          </Text>

          <AppInput
            label="Product Name *"
            value={name}
            onChangeText={setName}
            placeholder="Product name"
          />

          <AppInput
            label="SKU / Barcode"
            value={sku}
            onChangeText={setSku}
            placeholder="SKU"
          />

          <AppInput
            label="Category"
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. Snacks, Groceries"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AppInput
                label="Selling Price (₹) *"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <AppInput
                label="Cost Price (₹)"
                value={cost}
                onChangeText={setCost}
                keyboardType="numeric"
                placeholder="Optional"
              />
            </View>
          </View>

          <View style={{ marginTop: 12 }}>
            <AppButton
              title="Update Product"
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
  row: {
    flexDirection: 'row',
  },
});