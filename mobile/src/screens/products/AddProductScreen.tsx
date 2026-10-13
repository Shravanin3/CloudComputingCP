import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { createProduct } from '../../services/products/productService';
import { getCategories, Category } from '../../services/categories/categoryService';
import { colors } from '../../constants/colors';

export const AddProductScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [stock, setStock] = useState('10');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getCategories()
      .then((cats) => {
        if (isMounted && Array.isArray(cats) && cats.length > 0) {
          setCategories(cats);
        }
      })
      .catch((err) => {
        console.log('Failed to fetch categories:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

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
        categoryId: selectedCategoryId || undefined,
        category: (!selectedCategoryId && customCategory.trim()) ? customCategory.trim() : undefined,
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

          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Category (Optional)</Text>
            {categories.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipScrollView}
              >
                {categories.map((c) => {
                  const isSelected = selectedCategoryId === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedCategoryId(null);
                          setCustomCategory('');
                        } else {
                          setSelectedCategoryId(c.id);
                          setCustomCategory(c.name);
                        }
                      }}
                      style={[
                        styles.chip,
                        isSelected ? styles.chipSelected : styles.chipUnselected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                        ]}
                      >
                        {c.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : null}
            <AppInput
              label=""
              placeholder="e.g. Groceries, Snacks, Dairy"
              value={customCategory}
              onChangeText={(val) => {
                setCustomCategory(val);
                const matched = categories.find(
                  (c) => c.name.toLowerCase() === val.trim().toLowerCase()
                );
                setSelectedCategoryId(matched ? matched.id : null);
              }}
            />
          </View>

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
  categoryContainer: {
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  chipScrollView: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  chipTextUnselected: {
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
  },
});

