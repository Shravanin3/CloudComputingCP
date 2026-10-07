import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { getProducts } from '../../services/products/productService';
import { Product } from '../../types/product';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../constants/colors';

export const ProductsScreen = () => {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (e) {
      console.log('Error fetching products:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  if (loading) return <LoadingState message="Loading catalog..." />;

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q))
    );
  });

  return (
    <ScreenContainer style={{ padding: 16 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Product Catalog</Text>
          <Text style={styles.subtitle}>{products.length} active items in store</Text>
        </View>
        <AppButton
          title="+ Add Product"
          size="sm"
          onPress={() => navigation.navigate(ROUTES.ADD_PRODUCT)}
        />
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchBar}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput
          placeholder="Search products by name or SKU..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* PRODUCTS LIST */}
      {filteredProducts.length === 0 ? (
        <EmptyState message="No matching products found." />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const stock = item.inventory?.stockQuantity ?? item.stock ?? 0;
            const isLow = stock <= 10;

            return (
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.PRODUCT_DETAIL, { product: item })}
                activeOpacity={0.8}
              >
                <AppCard style={styles.productCard}>
                  <View style={styles.cardRow}>
                    <View style={styles.productIconBox}>
                      <Text style={{ fontSize: 22 }}>📦</Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <View style={styles.metaRow}>
                        {item.sku ? (
                          <Text style={styles.productSku}>SKU: {item.sku}</Text>
                        ) : null}
                        {item.category?.name ? (
                          <Text style={styles.productCategory}>
                            • {item.category.name}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.priceText}>₹{item.sellingPrice}</Text>
                      <View
                        style={[
                          styles.stockBadge,
                          { backgroundColor: isLow ? colors.dangerBg : colors.successBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.stockText,
                            { color: isLow ? colors.danger : colors.success },
                          ]}
                        >
                          {stock} in stock
                        </Text>
                      </View>
                    </View>
                  </View>
                </AppCard>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },

  productCard: {
    padding: 14,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  productSku: {
    fontSize: 11,
    color: colors.textMuted,
  },
  productCategory: {
    fontSize: 11,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
