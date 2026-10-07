import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { getSuppliers } from '../../services/suppliers/supplierService';
import { Supplier } from '../../types/supplier';
import { ROUTES } from '../../constants/routes';

export const SuppliersScreen = () => {
  const navigation = useNavigation<any>();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (e) {
      console.log('Error fetching suppliers:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSuppliers();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSuppliers();
  };

  if (loading) return <LoadingState message="Loading suppliers..." />;

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppButton
        title="+ Add Supplier"
        onPress={() => navigation.navigate(ROUTES.ADD_SUPPLIER)}
        style={{ marginBottom: 12 }}
      />

      {suppliers.length === 0 ? (
        <EmptyState message="No suppliers found." />
      ) : (
        <FlatList
          data={suppliers}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const hasPayable = (item.payableBalance || 0) > 0;
            return (
              <TouchableOpacity onPress={() => navigation.navigate(ROUTES.SUPPLIER_DETAIL, { supplier: item })}>
                <AppCard>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
                      <Text style={{ color: '#666', fontSize: 13, marginTop: 2 }}>{item.phone}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 12, color: '#888' }}>Payable (Debt)</Text>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 16,
                          color: hasPayable ? '#d9534f' : '#28a745',
                        }}
                      >
                        ₹{item.payableBalance || 0}
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