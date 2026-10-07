import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { createProduct } from '../../services/products/productService';
import { colors } from '../../constants/colors';

export const AddProductScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('10');
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

    const costPriceNum = cost ? Number(cost) : Math.round(sellingPriceNum * 0.8);
    const initialStockNum = parseInt(stock, 10) || 0;

    setLoading(true);
    try {
      await createProduct({
        name: name.trim(),
        sku: sku.trim() || undefined,
        category: category.trim() || undefined,
        sellingPrice: sellingPriceNum,
        costPrice: costPriceNum,
        initialStock: initialStockNum,
      } as any);
      Alert.alert('Success', `Product "${name}" has been created and synced to inventory.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to add product';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <AppCard style={styles.card}>
          <Text style={styles.heading}>Add New Product</Text>
          <Text style={styles.subheading}>
            Add items to your catalog for fast point-of-sale checkout and real-time inventory tracking.
          </Text>

          <AppInput
            label="Product Name *"
            placeholder="e.g. Parle-G Biscuit 250g"
            value={name}
            onChangeText={setName}
          />

          <AppInput
            label="SKU / Barcode (Optional)"
            placeholder="e.g. PR-001 or scan code"
            value={sku}
            onChangeText={setSku}
          />

          <AppInput
            label="Category (Optional)"
            placeholder="e.g. Groceries, Snacks, Dairy"
            value={category}
            onChangeText={setCategory}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <AppInput
                label="Selling Price (₹) *"
                placeholder="0.00"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <AppInput
                label="Cost Price (₹)"
                placeholder="Optional"
                value={cost}
                onChangeText={setCost}
                keyboardType="numeric"
              />
            </View>
          </View>

          <AppInput
            label="Initial Stock Quantity"
            placeholder="e.g. 50"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
          />

          <View style={{ marginTop: 12 }}>
            <AppButton
              title="Save Product to Catalog"
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
