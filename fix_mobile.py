import os
from pathlib import Path

base_dir = Path(r"d:\projects\clg sem 5\CC\cc_courseproject\mobile")

# 1. Add .env.example
(base_dir / ".env.example").write_text("API_BASE_URL=http://localhost:3000/api/v1\n", encoding="utf-8")

# 2. Secure Storage Utility
secure_storage_code = """import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';

export const secureStorage = {
  getToken: async () => await SecureStore.getItemAsync(TOKEN_KEY),
  setToken: async (token: string) => await SecureStore.setItemAsync(TOKEN_KEY, token),
  removeToken: async () => await SecureStore.deleteItemAsync(TOKEN_KEY),
};
"""
(base_dir / "src/utils/secureStorage.ts").write_text(secure_storage_code, encoding="utf-8")

# 3. Update apiClient to use env vars conceptually (React Native process.env is limited without babel plugin, so fallback to localhost)
api_client_code = """import axios from 'axios';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});
"""
(base_dir / "src/services/api/apiClient.ts").write_text(api_client_code, encoding="utf-8")

# 4. Enhance NewBillScreen with cart functionality
new_bill_code = """import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { getProducts } from '../../services/products/productService';
import { Product } from '../../types/product';
import { LoadingState } from '../../components/common/LoadingState';

export const NewBillScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (loading) return <LoadingState message="Loading POS..." />;

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <ScrollView>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Products</Text>
        {products.map(p => (
          <AppCard key={p.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontWeight: 'bold' }}>{p.name}</Text>
              <Text>${p.price}</Text>
            </View>
            <AppButton title="Add" onPress={() => addToCart(p)} />
          </AppCard>
        ))}

        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 }}>Cart</Text>
        {cart.length === 0 ? <Text>Cart is empty</Text> : null}
        {cart.map(item => (
          <AppCard key={item.product.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontWeight: 'bold' }}>{item.product.name}</Text>
              <Text>{item.quantity} x ${item.product.price}</Text>
            </View>
            <AppButton title="Remove" onPress={() => removeFromCart(item.product.id)} />
          </AppCard>
        ))}
        
        {cart.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'right' }}>Total: ${total}</Text>
            <AppButton title="Checkout" onPress={() => Alert.alert('Checkout', 'Sale successful (mock)')} />
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
};
"""
(base_dir / "src/screens/pos/NewBillScreen.tsx").write_text(new_bill_code, encoding="utf-8")

# 5. Enhance ProductsScreen with loading/error/empty states
products_code = """import React, { useState, useEffect } from 'react';
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
"""
(base_dir / "src/screens/products/ProductsScreen.tsx").write_text(products_code, encoding="utf-8")

print("Fixes applied.")
