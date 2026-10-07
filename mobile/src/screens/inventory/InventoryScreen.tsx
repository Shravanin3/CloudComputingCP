import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { getInventory, restockInventory } from '../../services/inventory/inventoryService';
import { Inventory } from '../../types/inventory';
import { colors } from '../../constants/colors';

export const InventoryScreen = () => {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);

  const [restockItemId, setRestockItemId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState('10');
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

  const handleRestock = async (productId: string, quantity?: number) => {
    const qty = quantity !== undefined ? quantity : parseInt(restockQty, 10);
    if (!qty || qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid positive number.');
      return;
    }
    setSubmitting(true);
    try {
      await restockInventory({ productId, quantityToAdd: qty });
      Alert.alert('Restock Successful', `Added ${qty} units to inventory stock.`);
      setRestockItemId(null);
      setRestockQty('10');
      fetchInventory();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to restock item';
      Alert.alert('Restock Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading inventory tracker..." />;

  const filteredItems = inventory.filter((item) => {
    const name = item.product?.name?.toLowerCase() || '';
    const sku = item.product?.sku?.toLowerCase() || '';
    const q = search.toLowerCase();
    const matchesSearch = name.includes(q) || sku.includes(q);

    const stock = item.stockQuantity ?? item.stock ?? 0;
    const matchesLowStock = filterLowStock ? stock <= 10 : true;

    return matchesSearch && matchesLowStock;
  });

  const lowStockTotal = inventory.filter(
    (i) => (i.stockQuantity ?? i.stock ?? 0) <= 10
  ).length;

  return (
    <ScreenContainer style={{ padding: 16 }}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Inventory Management</Text>
        <Text style={styles.subtitle}>
          {inventory.length} total products • {lowStockTotal} items low stock
        </Text>
      </View>

      {/* SEARCH AND FILTER BAR */}
      <View style={styles.searchBar}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput
          placeholder="Search inventory items..."
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

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, !filterLowStock && styles.filterChipActive]}
          onPress={() => setFilterLowStock(false)}
        >
          <Text
            style={[
              styles.filterChipText,
              !filterLowStock && styles.filterChipTextActive,
            ]}
          >
            All Items ({inventory.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filterLowStock && styles.filterChipActiveWarning]}
          onPress={() => setFilterLowStock(true)}
        >
          <Text
            style={[
              styles.filterChipText,
              filterLowStock && { color: '#B45309', fontWeight: '700' },
            ]}
          >
            ⚠️ Low Stock Only ({lowStockTotal})
          </Text>
        </TouchableOpacity>
      </View>

      {filteredItems.length === 0 ? (
        <EmptyState message="No matching inventory items." />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.productId}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => {
            const stock = item.stockQuantity ?? item.stock ?? 0;
            const isLow = stock <= 10;
            const isRestocking = restockItemId === item.productId;

            return (
              <AppCard style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>
                      {item.product?.name || `Product (${item.productId.slice(0, 8)})`}
                    </Text>
                    {item.product?.sku && (
                      <Text style={styles.itemSku}>SKU: {item.product.sku}</Text>
                    )}
                    {item.product?.sellingPrice && (
                      <Text style={styles.itemPrice}>₹{item.product.sellingPrice}</Text>
                    )}
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <View
                      style={[
                        styles.stockBadge,
                        { backgroundColor: isLow ? colors.dangerBg : colors.successBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stockBadgeText,
                          { color: isLow ? colors.danger : colors.success },
                        ]}
                      >
                        {stock} in stock
                      </Text>
                    </View>
                    {isLow && (
                      <Text style={styles.lowAlertText}>Reorder needed</Text>
                    )}
                  </View>
                </View>

                {/* RESTOCK ACCORDION BOX */}
                {isRestocking ? (
                  <View style={styles.restockBox}>
                    <Text style={styles.restockPrompt}>Add Units to Stock:</Text>
                    
                    {/* Quick increment buttons */}
                    <View style={styles.quickQtyRow}>
                      {[5, 10, 25, 50].map((num) => (
                        <TouchableOpacity
                          key={num}
                          style={styles.quickQtyBtn}
                          onPress={() => setRestockQty(num.toString())}
                        >
                          <Text style={styles.quickQtyText}>+{num}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={styles.restockInputRow}>
                      <TextInput
                        value={restockQty}
                        onChangeText={setRestockQty}
                        keyboardType="numeric"
                        placeholder="Quantity"
                        style={styles.restockInput}
                      />
                      <AppButton
                        title="Cancel"
                        variant="outline"
                        size="sm"
                        onPress={() => setRestockItemId(null)}
                        style={{ marginRight: 8, paddingHorizontal: 12 }}
                      />
                      <AppButton
                        title={submitting ? 'Saving...' : 'Add Stock'}
                        size="sm"
                        variant="success"
                        onPress={() => handleRestock(item.productId)}
                        disabled={submitting}
                        loading={submitting}
                      />
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.restockTrigger}
                    onPress={() => {
                      setRestockItemId(item.productId);
                      setRestockQty('10');
                    }}
                  >
                    <Text style={styles.restockTriggerText}>+ Restock Item</Text>
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

const styles = StyleSheet.create({
  header: {
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
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },

  filterRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterChipActiveWarning: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warning,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },

  itemCard: {
    padding: 14,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemSku: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  lowAlertText: {
    fontSize: 11,
    color: colors.danger,
    fontWeight: '600',
    marginTop: 3,
  },

  restockTrigger: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  restockTriggerText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },

  restockBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  restockPrompt: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  quickQtyRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  quickQtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickQtyText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  restockInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restockInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    backgroundColor: '#FFF',
    marginRight: 8,
  },
});