import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { getCustomers } from '../../services/customers/customerService';
import { Customer } from '../../types/customer';
import { ROUTES } from '../../constants/routes';

export const CustomersScreen = () => {
  const navigation = useNavigation<any>();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (e) {
      console.log('Error fetching customers:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCustomers();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  if (loading) return <LoadingState message="Loading customers..." />;

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppButton
        title="+ Add Customer"
        onPress={() => navigation.navigate(ROUTES.ADD_CUSTOMER)}
        style={{ marginBottom: 12 }}
      />

      {customers.length === 0 ? (
        <EmptyState message="No customers found." />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const hasCredit = (item.creditBalance || 0) > 0;
            return (
              <TouchableOpacity onPress={() => navigation.navigate(ROUTES.CUSTOMER_DETAIL, { customer: item })}>
                <AppCard>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
                      <Text style={{ color: '#666', fontSize: 13, marginTop: 2 }}>{item.phone}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 12, color: '#888' }}>Udhaar / Credit</Text>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 16,
                          color: hasCredit ? '#d9534f' : '#28a745',
                        }}
                      >
                        ₹{item.creditBalance || 0}
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