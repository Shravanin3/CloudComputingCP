import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { getProducts } from '../../services/products/productService';
import { Product } from '../../types/product';

export const ProductsScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState message="Loading products..." />;
  if (products.length === 0) return <EmptyState message="No products found." />;

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <FlatList
        data={products}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <AppCard>
            <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
            <Text>Price: ${item.price} | Stock: {item.stock}</Text>
          </AppCard>
        )}
      />
    </ScreenContainer>
  );
};
