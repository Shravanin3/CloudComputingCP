import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { getSalesReport, getProfitLossReport } from '../../services/reports/reportService';
import { colors } from '../../constants/colors';

export const ReportsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [plData, setPlData] = useState<any>(null);

  const fetchReports = async () => {
    try {
      setError(null);
      const [sales, pl] = await Promise.all([
        getSalesReport(),
        getProfitLossReport(),
      ]);
      setSalesData(sales);
      setPlData(pl);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Failed to load financial reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  if (loading) return <LoadingState message="Calculating financial reports..." />;
  if (error) return <ErrorState message={error} onRetry={fetchReports} />;

  const windowWidth = Dimensions.get('window').width;
  const chartWidth = Math.min(windowWidth - 32, 650);

  // Revenue & P&L metrics
  const revenue = Number(plData?.revenue ?? salesData?.totalRevenue ?? salesData?.totalSales ?? 0);
  const cogs = Number(plData?.costOfGoodsSold ?? plData?.cogs ?? 0);
  const grossProfit = Number(plData?.grossProfit ?? 0);
  const expenses = Number(plData?.totalExpenses ?? plData?.expenses ?? 0);
  const netProfit = Number(plData?.netProfit ?? 0);
  const margin = plData?.marginPercentage ?? (revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0);

  // Payment method data for PieChart
  const cash = Number(salesData?.breakdownByPaymentMethod?.cash || 0);
  const upi = Number(salesData?.breakdownByPaymentMethod?.upi || 0);
  const credit = Number(salesData?.breakdownByPaymentMethod?.credit || 0);
  const hasPaymentData = cash > 0 || upi > 0 || credit > 0;

  const pieData = hasPaymentData
    ? [
        {
          name: 'Cash',
          population: cash,
          color: '#10B981',
          legendFontColor: '#334155',
          legendFontSize: 12,
        },
        {
          name: 'UPI',
          population: upi,
          color: '#3B82F6',
          legendFontColor: '#334155',
          legendFontSize: 12,
        },
        {
          name: 'Credit',
          population: credit,
          color: '#F59E0B',
          legendFontColor: '#334155',
          legendFontSize: 12,
        },
      ]
    : [
        {
          name: 'No Sales Yet',
          population: 1,
          color: '#CBD5E1',
          legendFontColor: '#64748B',
          legendFontSize: 12,
        },
      ];

  // BarChart Data: Financial Flow
  const barChartData = {
    labels: ['Revenue', 'COGS', 'Expenses', 'Net P/L'],
    datasets: [
      {
        data: [
          Math.max(0, revenue),
          Math.max(0, cogs),
          Math.max(0, expenses),
          Math.max(0, netProfit),
        ],
      },
    ],
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Financial Analytics</Text>
          <Text style={styles.pageSubtitle}>Live Profit & Loss and Sales performance</Text>
        </View>

        {/* 2X2 FINANCIAL KPI GRID */}
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, { borderLeftColor: colors.primary }]}>
            <Text style={styles.kpiLabel}>Total Revenue</Text>
            <Text style={styles.kpiValue}>₹{revenue.toLocaleString('en-IN')}</Text>
            <Text style={styles.kpiSub}>From {salesData?.totalSalesCount || 0} bills</Text>
          </View>

          <View style={[styles.kpiCard, { borderLeftColor: colors.info }]}>
            <Text style={styles.kpiLabel}>Gross Profit</Text>
            <Text style={[styles.kpiValue, { color: colors.info }]}>₹{grossProfit.toLocaleString('en-IN')}</Text>
            <Text style={styles.kpiSub}>Revenue - COGS</Text>
          </View>

          <View style={[styles.kpiCard, { borderLeftColor: colors.danger }]}>
            <Text style={styles.kpiLabel}>Total Expenses</Text>
            <Text style={[styles.kpiValue, { color: colors.danger }]}>₹{expenses.toLocaleString('en-IN')}</Text>
            <Text style={styles.kpiSub}>Overhead expenses</Text>
          </View>

          <View style={[styles.kpiCard, { borderLeftColor: netProfit >= 0 ? colors.success : colors.danger }]}>
            <Text style={styles.kpiLabel}>Net Profit</Text>
            <Text
              style={[
                styles.kpiValue,
                { color: netProfit >= 0 ? colors.success : colors.danger },
              ]}
            >
              ₹{netProfit.toLocaleString('en-IN')}
            </Text>
            <View
              style={[
                styles.marginBadge,
                { backgroundColor: netProfit >= 0 ? colors.successBg : colors.dangerBg },
              ]}
            >
              <Text
                style={[
                  styles.marginText,
                  { color: netProfit >= 0 ? colors.success : colors.danger },
                ]}
              >
                Margin: {margin}%
              </Text>
            </View>
          </View>
        </View>

        {/* P&L BREAKDOWN COMPARISON BAR CHART */}
        <AppCard style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Income & Cost Structure</Text>
          <Text style={styles.cardSubtitle}>Visual breakdown of store economics (₹)</Text>
          
          <BarChart
            data={barChartData}
            width={chartWidth - 28}
            height={220}
            yAxisLabel="₹"
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(71, 85, 105, ${opacity})`,
              style: { borderRadius: 12 },
              propsForBackgroundLines: {
                stroke: '#F1F5F9',
              },
            }}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </AppCard>

        {/* PAYMENT METHODS PIE CHART */}
        <AppCard style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Payment Method Distribution</Text>
          <Text style={styles.cardSubtitle}>Cash vs UPI vs Credit (Udhaar)</Text>

          <PieChart
            data={pieData}
            width={chartWidth - 28}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />

          <View style={styles.paymentSummaryRow}>
            <View style={styles.paymentSummaryItem}>
              <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.paymentSummaryText}>Cash: ₹{cash.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.paymentSummaryItem}>
              <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.paymentSummaryText}>UPI: ₹{upi.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.paymentSummaryItem}>
              <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.paymentSummaryText}>Credit: ₹{credit.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </AppCard>

        {/* DETAILED P&L SUMMARY TABLE */}
        <AppCard style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Profit & Loss Statement</Text>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Gross Sales Revenue</Text>
            <Text style={styles.tableValue}>₹{revenue.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Less: Cost of Goods Sold (COGS)</Text>
            <Text style={[styles.tableValue, { color: colors.danger }]}>-₹{cogs.toLocaleString('en-IN')}</Text>
          </View>
          <View style={[styles.tableRow, styles.subtotalRow]}>
            <Text style={styles.tableSubtotalLabel}>Gross Profit</Text>
            <Text style={styles.tableSubtotalValue}>₹{grossProfit.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Less: Operating Expenses (Rent, Bills, Salaries)</Text>
            <Text style={[styles.tableValue, { color: colors.danger }]}>-₹{expenses.toLocaleString('en-IN')}</Text>
          </View>
          <View style={[styles.tableRow, styles.finalRow]}>
            <Text style={styles.tableFinalLabel}>Net Profit / Loss</Text>
            <Text
              style={[
                styles.tableFinalValue,
                { color: netProfit >= 0 ? colors.success : colors.danger },
              ]}
            >
              ₹{netProfit.toLocaleString('en-IN')}
            </Text>
          </View>
        </AppCard>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4,
  },
  kpiSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  marginBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  marginText: {
    fontSize: 11,
    fontWeight: '700',
  },

  cardContainer: {
    padding: 16,
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
    alignSelf: 'center',
    marginVertical: 4,
  },

  paymentSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
  },
  paymentSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  paymentSummaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },

  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  tableValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtotalRow: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  tableSubtotalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  tableSubtotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  finalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    marginTop: 4,
    paddingTop: 12,
  },
  tableFinalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  tableFinalValue: {
    fontSize: 18,
    fontWeight: '800',
  },
});
