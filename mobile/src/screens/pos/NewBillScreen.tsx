import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, Alert, } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { getProducts } from '../../services/products/productService';
import { getCustomers } from '../../services/customers/customerService';
import { createSale } from '../../services/sales/salesService';
import { Product } from '../../types/product';
import { Customer } from '../../types/customer';
import { LoadingState } from '../../components/common/LoadingState';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';

export const NewBillScreen = () => {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CREDIT' | 'UPI'>('CASH');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getProducts(), getCustomers()]).then(([prods, custs]) => {
      setProducts(prods);
      setCustomers(custs);
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

  const total = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);

  const confirmSale = async () => {
    if (cart.length === 0) return Alert.alert('Error', 'Cart is empty');
    if (paymentMethod === 'CREDIT' && !selectedCustomerId) return Alert.alert('Error', 'Select a customer for Credit sale');
    
    setSubmitting(true);
    try {
      await createSale({
        customerId: selectedCustomerId || undefined,
        paymentMethod,
        items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })), 
      });
      Alert.alert('Success', 'Sale created successfully');
      setCart([]);
      setSelectedCustomerId('');
      navigation.navigate(ROUTES.HOME);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to complete sale';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading POS..." />;

  return (
    <ScreenContainer>
      <ScrollView>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>Products</Text>
        {products.map(p => (
          <AppCard key={p.id}>
            <Text>{p.name} - ₹{p.sellingPrice}</Text>
            <AppButton title="Add" onPress={() => addToCart(p)} />
          </AppCard>
        ))}

        <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>Cart</Text>
        {cart.map(c => (
          <AppCard key={c.product.id}>
            <Text>{c.product.name} x {c.quantity} = ₹{c.product.sellingPrice * c.quantity}</Text>
            <AppButton title="Remove" onPress={() => removeFromCart(c.product.id)} />
          </AppCard>
        ))}
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 10 }}>Total: ₹{total}</Text>

        <Text style={{ fontSize: 18, fontWeight: 'bold', marginVertical: 10 }}>Customer & Payment</Text>
        
        {/* Simple implementation using text logic since Picker is deprecated, but we can rely on standard RN Picker or simple buttons */}
        <AppCard>
          <Text>Selected Customer: {customers.find(c => c.id === selectedCustomerId)?.name || 'None'}</Text>
          {customers.map(c => (
            <AppButton key={c.id} title={`Select ${c.name}`} onPress={() => setSelectedCustomerId(c.id)} />
          ))}
          <AppButton title="Clear Customer" onPress={() => setSelectedCustomerId('')} />
        </AppCard>

        <AppCard>
          <Text>Payment Method: {paymentMethod}</Text>
          <AppButton title="Cash" onPress={() => setPaymentMethod('CASH')} />
          <AppButton title="UPI" onPress={() => setPaymentMethod('UPI')} />
          <AppButton title="Credit" onPress={() => setPaymentMethod('CREDIT')} />
        </AppCard>

        <AppButton title={submitting ? "Processing..." : "Confirm Sale"} onPress={confirmSale} disabled={submitting || cart.length === 0} />
      </ScrollView>
    </ScreenContainer>
  );
};
