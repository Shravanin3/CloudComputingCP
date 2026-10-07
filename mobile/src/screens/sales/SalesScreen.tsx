import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { getSales } from '../../services/sales/salesService';
import { Sale } from '../../types/sales';
import { ROUTES } from '../../constants/routes';

export const SalesScreen = () => {
  const navigation = useNavigation<any>();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSales = async () => {
    try {
      const data = await getSales();
      setSales(data);
    } catch (e) {
      console.log('Error fetching sales:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSales();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSales();
  };

  const getBadgeColor = (method: string) => {
    switch (method) {
      case 'CASH':
        return { bg: '#d4edda', text: '#155724' };
      case 'UPI':
        return { bg: '#cce5ff', text: '#004085' };
      case 'CREDIT':
        return { bg: '#fff3cd', text: '#856404' };
      default:
        return { bg: '#e2e3e5', text: '#383d41' };
    }
  };

  if (loading) return <LoadingState message="Loading sales..." />;

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppButton
        title="+ Create New Bill"
        onPress={() => navigation.navigate(ROUTES.NEW_BILL)}
        style={{ marginBottom: 12 }}
      />

      {sales.length === 0 ? (
        <EmptyState message="No sales recorded yet." />
      ) : (
        <FlatList
          data={sales}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const badge = getBadgeColor(item.paymentMethod);
            const customerName =
              typeof item.customer === 'object' && item.customer?.name
                ? item.customer.name
                : typeof item.customer === 'string'
                ? item.customer
                : 'Walk-in Customer';
            const dateStr = item.saleDate ? new Date(item.saleDate).toLocaleDateString() : '';

            return (
              <TouchableOpacity onPress={() => navigation.navigate(ROUTES.SALE_DETAIL, { sale: item })}>
                <AppCard>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{customerName}</Text>
                      <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{dateStr}</Text>
                      <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>
                        {item.saleItems?.length || 0} item(s)
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 17, color: '#333' }}>
                        ₹{item.totalAmount}
                      </Text>
                      <View
                        style={{
                          backgroundColor: badge.bg,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 4,
                          marginTop: 4,
                        }}
                      >
                        <Text style={{ color: badge.text, fontSize: 11, fontWeight: '700' }}>
                          {item.paymentMethod}
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