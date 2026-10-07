import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { getProducts } from '../../services/products/productService';
import { Product } from '../../types/product';
import { ROUTES } from '../../constants/routes';

export const ProductsScreen = () => {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  if (loading) return <LoadingState message="Loading products..." />;

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppButton
        title="+ Add New Product"
        onPress={() => navigation.navigate(ROUTES.ADD_PRODUCT)}
        style={{ marginBottom: 12 }}
      />

      {products.length === 0 ? (
        <EmptyState message="No products found." />
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const stock = item.inventory?.stockQuantity ?? item.stock ?? 0;
            return (
              <TouchableOpacity onPress={() => navigation.navigate(ROUTES.PRODUCT_DETAIL, { product: item })}>
                <AppCard>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
                      {item.sku && <Text style={{ color: '#666', fontSize: 12 }}>SKU: {item.sku}</Text>}
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontWeight: '600', color: '#007AFF' }}>₹{item.sellingPrice}</Text>
                      <Text style={{ fontSize: 12, color: stock <= 5 ? '#d9534f' : '#28a745' }}>
                        Stock: {stock}
                      </Text>
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
