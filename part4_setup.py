import os
from pathlib import Path

base_dir = Path(r"d:\projects\clg sem 5\CC\cc_courseproject\mobile")

# 1. Update reportService.ts
report_service = """import { apiClient } from '../api/apiClient';
import { USE_MOCK_DATA, delay } from '../dataSource/config';

export const getSalesReport = async (): Promise<any> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return {
      totalSales: 50000,
      numberOfSales: 120,
      salesTrend: '+10%'
    };
  }
  const response = await apiClient.get('/reports/sales');
  return response.data;
};

export const getProfitLossReport = async (): Promise<any> => {
  if (USE_MOCK_DATA) {
    await delay(500);
    return {
      revenue: 50000,
      cogs: 20000,
      grossProfit: 30000,
      expenses: 10000,
      netProfit: 20000
    };
  }
  const response = await apiClient.get('/reports/profit-loss');
  return response.data;
};
"""
(base_dir / "src/services/reports/reportService.ts").write_text(report_service, encoding="utf-8")

# 2. Update ReportsScreen.tsx
reports_screen = """import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { getSalesReport, getProfitLossReport } from '../../services/reports/reportService';

export const ReportsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [plData, setPlData] = useState<any>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sales, pl] = await Promise.all([
        getSalesReport(),
        getProfitLossReport()
      ]);
      setSalesData(sales);
      setPlData(pl);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <LoadingState message="Loading reports..." />;
  if (error) return <ErrorState message={error} onRetry={fetchReports} />;

  return (
    <ScreenContainer>
      <ScrollView>
        <AppCard>
          <Text style={styles.title}>Sales Report</Text>
          <Text>Total Sales: ₹{salesData?.totalSales}</Text>
          <Text>Number of Sales: {salesData?.numberOfSales}</Text>
          <Text>Trend: {salesData?.salesTrend}</Text>
        </AppCard>

        <AppCard>
          <Text style={styles.title}>Profit & Loss</Text>
          <Text>Revenue: ₹{plData?.revenue}</Text>
          <Text>COGS: ₹{plData?.cogs}</Text>
          <Text>Gross Profit: ₹{plData?.grossProfit}</Text>
          <Text>Expenses: ₹{plData?.expenses}</Text>
          <Text style={styles.netProfit}>Net Profit: ₹{plData?.netProfit}</Text>
        </AppCard>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  netProfit: { fontSize: 16, fontWeight: 'bold', marginTop: 10, color: 'green' }
});
"""
(base_dir / "src/screens/reports/ReportsScreen.tsx").write_text(reports_screen, encoding="utf-8")


# 3. Update SettingsScreen.tsx
settings_screen = """import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { useAuth } from '../../navigation/AuthContext';

export const SettingsScreen = () => {
  const { user, logout } = useAuth();

  return (
    <ScreenContainer>
      <AppCard>
        <Text style={styles.title}>Profile</Text>
        <Text>Name: {user?.name || 'Unknown'}</Text>
        <Text>Email: {user?.email}</Text>
        <Text>Role: {user?.role}</Text>
      </AppCard>

      <AppButton title="Logout" onPress={logout} />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});
"""
(base_dir / "src/screens/settings/SettingsScreen.tsx").write_text(settings_screen, encoding="utf-8")


print("Part 4 implemented.")
