import React, { useState, useEffect } from 'react';
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
          <Text>Total Sales: ₹{salesData?.totalRevenue ?? salesData?.totalSales ?? 0}</Text>
          <Text>Number of Sales: {salesData?.totalSalesCount ?? salesData?.numberOfSales ?? 0}</Text>
          {salesData?.totalItemsSold !== undefined && (
            <Text>Total Items Sold: {salesData.totalItemsSold}</Text>
          )}
          {salesData?.breakdownByPaymentMethod && (
            <Text>Cash: ₹{salesData.breakdownByPaymentMethod.cash || 0} | UPI: ₹{salesData.breakdownByPaymentMethod.upi || 0} | Credit: ₹{salesData.breakdownByPaymentMethod.credit || 0}</Text>
          )}
          {salesData?.salesTrend && <Text>Trend: {salesData.salesTrend}</Text>}
        </AppCard>

        <AppCard>
          <Text style={styles.title}>Profit & Loss</Text>
          <Text>Revenue: ₹{plData?.revenue ?? 0}</Text>
          <Text>COGS: ₹{plData?.costOfGoodsSold ?? plData?.cogs ?? 0}</Text>
          <Text>Gross Profit: ₹{plData?.grossProfit ?? 0}</Text>
          <Text>Expenses: ₹{plData?.totalExpenses ?? plData?.expenses ?? 0}</Text>
          <Text style={styles.netProfit}>Net Profit: ₹{plData?.netProfit ?? 0}</Text>
          {plData?.marginPercentage !== undefined && (
            <Text style={{ marginTop: 4, color: '#555' }}>Margin: {plData.marginPercentage}%</Text>
          )}
        </AppCard>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  netProfit: { fontSize: 16, fontWeight: 'bold', marginTop: 10, color: 'green' }
});
