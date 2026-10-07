import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { getInventory, restockInventory } from '../../services/inventory/inventoryService';
import { Inventory } from '../../types/inventory';

export const InventoryScreen = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restockItemId, setRestockItemId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    try {
      const data = await getInventory();
      setInventory(data);
    } catch (e) {
      console.log('Error fetching inventory:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchInventory();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchInventory();
  };

  const handleRestock = async (productId: string) => {
    const qty = parseInt(restockQty, 10);
    if (!qty || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid positive quantity.');
      return;
    }
    setSubmitting(true);
    try {
      await restockInventory({ productId, quantityToAdd: qty });
      Alert.alert('Success', `Added ${qty} units to stock.`);
      setRestockItemId(null);
      setRestockQty('');
      fetchInventory();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to restock item';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading inventory..." />;

  return (
    <ScreenContainer style={{ padding: 16 }}>
      {inventory.length === 0 ? (
        <EmptyState message="No inventory items found." />
      ) : (
        <FlatList
          data={inventory}
          keyExtractor={(item) => item.productId}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const stock = item.stockQuantity ?? item.stock ?? 0;
            const isLow = stock <= 10;
            const isRestocking = restockItemId === item.productId;

            return (
              <AppCard>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                      {item.product?.name || `Product (${item.productId.slice(0, 8)}...)`}
                    </Text>
                    {item.product?.sku && (
                      <Text style={{ color: '#666', fontSize: 12 }}>SKU: {item.product.sku}</Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: isLow ? '#f8d7da' : '#d4edda',
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: 'bold',
                          color: isLow ? '#721c24' : '#155724',
                          fontSize: 14,
                        }}
                      >
                        {stock} in stock
                      </Text>
                    </View>
                    {isLow && (
                      <Text style={{ fontSize: 11, color: '#d9534f', marginTop: 2, fontWeight: '600' }}>
                        Low Stock Alert
                      </Text>
                    )}
                  </View>
                </View>

                {isRestocking ? (
                  <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }}>
                    <AppInput
                      label="Units to Add"
                      placeholder="e.g. 20"
                      value={restockQty}
                      onChangeText={setRestockQty}
                      keyboardType="numeric"
                    />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <AppButton
                        title="Cancel"
                        onPress={() => {
                          setRestockItemId(null);
                          setRestockQty('');
                        }}
                        style={{ flex: 1, marginRight: 8, backgroundColor: '#6c757d' }}
                      />
                      <AppButton
                        title={submitting ? 'Saving...' : 'Confirm'}
                        onPress={() => handleRestock(item.productId)}
                        disabled={submitting}
                        style={{ flex: 1, marginLeft: 8 }}
                      />
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setRestockItemId(item.productId);
                      setRestockQty('');
                    }}
                    style={{ marginTop: 10, alignSelf: 'flex-start' }}
                  >
                    <Text style={{ color: '#007AFF', fontWeight: '600', fontSize: 14 }}>+ Restock</Text>
                  </TouchableOpacity>
                )}
              </AppCard>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
};