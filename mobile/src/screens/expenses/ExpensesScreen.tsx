import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { getExpenses } from '../../services/expenses/expenseService';
import { Expense } from '../../types/expense';
import { ROUTES } from '../../constants/routes';

export const ExpensesScreen = () => {
  const navigation = useNavigation<any>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchExpenses = async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (e) {
      console.log('Error fetching expenses:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  if (loading) return <LoadingState message="Loading expenses..." />;

  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppButton
        title="+ Add Expense"
        onPress={() => navigation.navigate(ROUTES.ADD_EXPENSE)}
        style={{ marginBottom: 12 }}
      />

      <AppCard style={{ marginBottom: 12, backgroundColor: '#f8d7da' }}>
        <Text style={{ fontSize: 13, color: '#721c24' }}>Total Recorded Expenses</Text>
        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#721c24', marginTop: 4 }}>
          ₹{totalExpenses}
        </Text>
      </AppCard>

      {expenses.length === 0 ? (
        <EmptyState message="No expenses recorded." />
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const dateStr = item.date || item.expenseDate
              ? new Date(item.date || item.expenseDate!).toLocaleDateString()
              : '';

            return (
              <AppCard>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.category}</Text>
                    {item.description ? (
                      <Text style={{ color: '#555', fontSize: 13, marginTop: 2 }}>{item.description}</Text>
                    ) : null}
                    <Text style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{dateStr}</Text>
                  </View>
                  <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#d9534f' }}>
                    -₹{item.amount}
                  </Text>
                </View>
              </AppCard>
            );
          }}
        />
      )}
    </ScreenContainer>
  );
};