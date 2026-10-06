import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { getDashboardSummary } from '../../services/dashboard/dashboardService';
import { DashboardSummary } from '../../types/dashboard';
import { ROUTES } from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardSummary();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading dashboard..." />;
  if (error || !data) return <ErrorState message={error || 'No data'} onRetry={fetchDashboard} />;

  return (
    <ScreenContainer>
      <ScrollView>
        {/* DASHBOARD METRICS */}
        <AppCard>
          <Text style={styles.title}>Dashboard</Text>
          <Text>Total Sales: ₹{data.totalSales || 0}</Text>
          <Text>Expenses: ₹{data.expenses || 0}</Text>
          <Text>Cash Received: ₹{data.cashReceived || 0}</Text>
          <Text>Pending Credit: ₹{data.pendingCredit || 0}</Text>
        </AppCard>

        {/* NAVIGATION QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate(ROUTES.NEW_BILL)}>
            <Text style={styles.gridItemText}>New Bill / POS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate(ROUTES.PRODUCTS)}>
            <Text style={styles.gridItemText}>Products</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate(ROUTES.INVENTORY)}>
            <Text style={styles.gridItemText}>Inventory</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate(ROUTES.SALES)}>
            <Text style={styles.gridItemText}>Sales History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate(ROUTES.CUSTOMERS)}>
            <Text style={styles.gridItemText}>Customers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate(ROUTES.SUPPLIERS)}>
            <Text style={styles.gridItemText}>Suppliers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate(ROUTES.EXPENSES)}>
            <Text style={styles.gridItemText}>Expenses</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate(ROUTES.REPORTS)}>
            <Text style={styles.gridItemText}>Reports</Text>
          </TouchableOpacity>
        </View>

        {/* SETTINGS LINK */}
        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate(ROUTES.SETTINGS)}>
          <Text style={styles.settingsButtonText}>Settings / Profile</Text>
        </TouchableOpacity>

      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10, marginLeft: 5 },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridItemText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  settingsButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 30,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
