import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { updateProduct } from '../../services/products/productService';
import { getCategories, Category } from '../../services/categories/categoryService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../constants/colors';

export const EditProductScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const product = route.params?.product;

  const [name, setName] = useState(product?.name || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const initialCatId = product?.categoryId || (typeof product?.category === 'object' ? product?.category?.id : null);
  const initialCatName = typeof product?.category === 'object' ? product?.category?.name : (product?.category || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCatId || null);
  const [customCategory, setCustomCategory] = useState(initialCatName);
  const [price, setPrice] = useState(
    product?.sellingPrice?.toString() ?? product?.price?.toString() ?? ''
  );
  const [cost, setCost] = useState(product?.costPrice?.toString() || '');
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
    console.log('[DEBUG-EDIT-PRODUCT] 1. Save button pressed, state values:', {
      name,
      price,
      cost,
      sku,
      selectedCategoryId,
      customCategory,
      productId: product?.id,
    });

    if (!name.trim()) {
      console.log('[DEBUG-EDIT-PRODUCT] 2. Form validation failed: Name is empty');
      Alert.alert('Required Field', 'Please enter a product name.');
      return;
    }
    const sellingPriceNum = Number(price);
    if (!sellingPriceNum || sellingPriceNum <= 0) {
      console.log('[DEBUG-EDIT-PRODUCT] 2. Form validation failed: Invalid price', price);
      Alert.alert('Required Field', 'Please enter a valid positive selling price.');
      return;
    }

    console.log('[DEBUG-EDIT-PRODUCT] 2. Form validation passed:', {
      name: name.trim(),
      sellingPrice: sellingPriceNum,
      cost,
      sku,
      selectedCategoryId,
      customCategory,
    });

    setLoading(true);
    try {
      const updatedProduct = await updateProduct(product.id, {
        name: name.trim(),
        sku: sku.trim() || undefined,
        categoryId: selectedCategoryId || undefined,
        category: (!selectedCategoryId && customCategory.trim()) ? customCategory.trim() : undefined,
        sellingPrice: sellingPriceNum,
        costPrice: cost ? Number(cost) : undefined,
      } as any);

      console.log('[DEBUG-EDIT-PRODUCT] 5a. Data saved, updatedProduct returned by service:', updatedProduct);

      Alert.alert('Success', 'Product updated successfully in catalog.', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate(ROUTES.PRODUCT_DETAIL, { product: updatedProduct });
          },
        },
      ]);
    } catch (e: any) {
      console.log('[DEBUG-EDIT-PRODUCT] Error during updateProduct:', e);
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

          <View style={styles.categoryContainer}>
            <Text style={styles.categoryLabel}>Category</Text>
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
              placeholder="e.g. Snacks, Groceries"
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