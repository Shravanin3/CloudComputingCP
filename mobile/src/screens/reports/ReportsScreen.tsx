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
import {
  ModernBezierLineChart,
  ModernPillarBarChart,
  ModernPieChartCard,
  ModernFinancialHealthRings,
  ModernBreakdownBarChart,
} from '../../components/charts/ModernCharts';
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
  const [chartView, setChartView] = useState<'TREND' | 'PILLARS'>('TREND');

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

  if (loading) return <LoadingState message="Calculating financial analytics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchReports} />;

  const windowWidth = Dimensions.get('window').width;
  const chartWidth = Math.min(windowWidth - 48, 620);

  // Core Financial Metrics
  const revenue = Number(plData?.revenue ?? salesData?.totalRevenue ?? salesData?.totalSales ?? 0);
  const cogs = Number(plData?.costOfGoodsSold ?? plData?.cogs ?? 0);
  const grossProfit = Number(plData?.grossProfit ?? 0);
  const expenses = Number(plData?.totalExpenses ?? plData?.expenses ?? 0);
  const netProfit = Number(plData?.netProfit ?? 0);
  const margin = Number(plData?.marginPercentage ?? (revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : 0));

  // Margin percentages for health rings
  const grossMarginPct = revenue > 0 ? Math.round((grossProfit / revenue) * 100) : 0;
  const netMarginPct = revenue > 0 ? Math.round((netProfit / revenue) * 100) : 0;

  // Payment Breakdown
  const cash = Number(salesData?.breakdownByPaymentMethod?.cash || 0);
  const upi = Number(salesData?.breakdownByPaymentMethod?.upi || 0);
  const credit = Number(salesData?.breakdownByPaymentMethod?.credit || 0);
  const instantCollections = cash + upi;
  const cashRatio = revenue > 0 ? Math.round((instantCollections / revenue) * 100) : 100;

  const paymentPieData = [
    {
      name: 'Cash',
      population: cash,
      color: '#10B981',
      legendFontColor: '#334155',
      legendFontSize: 12,
    },
    {
      name: 'UPI / QR',
      population: upi,
      color: '#3B82F6',
      legendFontColor: '#334155',
      legendFontSize: 12,
    },
    {
      name: 'Udhaar (Credit)',
      population: credit,
      color: '#F59E0B',
      legendFontColor: '#334155',
      legendFontSize: 12,
    },
  ];

  // Daily Trend Line Chart Data
  const dailyTrend = salesData?.dailyTrend || [];
  const trendLabels = dailyTrend.length > 0
    ? dailyTrend.map((d: any) => {
        const parts = d.date.split('-');
        return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : d.date;
      })
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const trendSales = dailyTrend.length > 0
    ? dailyTrend.map((d: any) => Number(d.sales) || 0)
    : [0, 0, 0, 0, 0, 0, 0];

  // Expense Category Pie Chart Data
  const expenseCategories = plData?.categoryBreakdown || [];
  const CATEGORY_COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EC4899', '#06B6D4'];
  const expensePieData = expenseCategories.map((c: any, idx: number) => ({
    name: c.category || 'Other',
    population: Number(c.amount) || 0,
    color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
    legendFontColor: '#334155',
    legendFontSize: 12,
  }));

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* HEADER BANNER */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Financial Reports & Analytics</Text>
          <Text style={styles.pageSubtitle}>Live P&L, sales trajectory & payment intelligence</Text>
        </View>

        {/* 2X2 FINANCIAL KPI GRID */}
        <View style={styles.kpiGrid}>
          {/* Revenue */}
          <View style={[styles.kpiCard, { borderLeftColor: colors.primary }]}>
            <Text style={styles.kpiLabel}>Total Revenue</Text>
            <Text style={styles.kpiValue}>₹{revenue.toLocaleString('en-IN')}</Text>
            <Text style={styles.kpiSub}>From {salesData?.totalSalesCount || 0} invoices</Text>
          </View>

          {/* Gross Profit */}
          <View style={[styles.kpiCard, { borderLeftColor: colors.info }]}>
            <Text style={styles.kpiLabel}>Gross Profit</Text>
            <Text style={[styles.kpiValue, { color: colors.info }]}>₹{grossProfit.toLocaleString('en-IN')}</Text>
            <Text style={styles.kpiSub}>{grossMarginPct}% gross margin</Text>
          </View>

          {/* Operating Expenses */}
          <View style={[styles.kpiCard, { borderLeftColor: colors.danger }]}>
            <Text style={styles.kpiLabel}>Operating Expenses</Text>
            <Text style={[styles.kpiValue, { color: colors.danger }]}>₹{expenses.toLocaleString('en-IN')}</Text>
            <Text style={styles.kpiSub}>Overhead & store bills</Text>
          </View>

          {/* Net Profit */}
          <View style={[styles.kpiCard, { borderLeftColor: netProfit >= 0 ? colors.success : colors.danger }]}>
            <Text style={styles.kpiLabel}>Net Operating Profit</Text>
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

        {/* ------------------------------------------------------------- */}
        {/* GRAPH 1: REVENUE TREND CURVE & ECONOMIC PILLARS */}
        {/* ------------------------------------------------------------- */}
        <AppCard style={styles.cardContainer}>
          <View style={styles.cardHeaderFlex}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Sales Trajectory & Economics</Text>
              <Text style={styles.cardSubtitle}>
                {chartView === 'TREND' ? '7-day daily sales revenue curve (₹)' : 'Comparative pillars of store economics'}
              </Text>
            </View>

            {/* Toggle Switch */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, chartView === 'TREND' && styles.toggleBtnActive]}
                onPress={() => setChartView('TREND')}
              >
                <Text style={[styles.toggleBtnText, chartView === 'TREND' && styles.toggleBtnTextActive]}>
                  📈 Trend
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, chartView === 'PILLARS' && styles.toggleBtnActive]}
                onPress={() => setChartView('PILLARS')}
              >
                <Text style={[styles.toggleBtnText, chartView === 'PILLARS' && styles.toggleBtnTextActive]}>
                  📊 Pillars
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {chartView === 'TREND' ? (
            <ModernBezierLineChart
              labels={trendLabels}
              data={trendSales}
              width={chartWidth}
              height={220}
              primaryLabel="Revenue (₹)"
              primaryColor="#4F46E5"
            />
          ) : (
            <ModernPillarBarChart
              labels={['Revenue', 'COGS', 'Expenses', 'Net P/L']}
              data={[revenue, cogs, expenses, Math.max(0, netProfit)]}
              width={chartWidth}
              height={220}
            />
          )}
        </AppCard>

        {/* ------------------------------------------------------------- */}
        {/* GRAPH 2: PAYMENT METHOD DISTRIBUTION PIE CHART */}
        {/* ------------------------------------------------------------- */}
        <AppCard style={styles.cardContainer}>
          <ModernPieChartCard
            title="Payment Method Breakdown"
            subtitle="Share of collections: Cash vs UPI vs Udhaar"
            data={paymentPieData}
            width={chartWidth}
            height={190}
          />
        </AppCard>

        {/* ------------------------------------------------------------- */}
        {/* GRAPH 3: FINANCIAL HEALTH CONCENTRIC PROGRESS RINGS */}
        {/* ------------------------------------------------------------- */}
        <AppCard style={styles.cardContainer}>
          <ModernFinancialHealthRings
            grossMarginPct={grossMarginPct}
            netMarginPct={netMarginPct}
            cashCollectionPct={cashRatio}
            width={chartWidth}
            height={190}
          />
        </AppCard>

        {/* ------------------------------------------------------------- */}
        {/* GRAPH 4: OPERATING EXPENSE BREAKDOWN (IF AVAILABLE) */}
        {/* ------------------------------------------------------------- */}
        {expensePieData.length > 0 && (
          <AppCard style={styles.cardContainer}>
            <ModernPieChartCard
              title="Expense Categories"
              subtitle="Where overhead funds are allocated"
              data={expensePieData}
              width={chartWidth}
              height={190}
            />
          </AppCard>
        )}

        {/* ------------------------------------------------------------- */}
        {/* DETAILED P&L SUMMARY STATEMENT */}
        {/* ------------------------------------------------------------- */}
        <AppCard style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Detailed Profit & Loss Statement</Text>
          <Text style={[styles.cardSubtitle, { marginBottom: 12 }]}>Audited double-entry store summary</Text>

          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Gross Sales Revenue</Text>
            <Text style={styles.tableValue}>₹{revenue.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Less: Cost of Goods Sold (COGS)</Text>
            <Text style={[styles.tableValue, { color: colors.danger }]}>-₹{cogs.toLocaleString('en-IN')}</Text>
          </View>
          <View style={[styles.tableRow, styles.subtotalRow]}>
            <Text style={styles.tableSubtotalLabel}>Gross Operating Profit</Text>
            <Text style={styles.tableSubtotalValue}>₹{grossProfit.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Less: Overhead Operating Expenses</Text>
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
    marginTop: 4,
  },
  marginText: {
    fontSize: 10,
    fontWeight: '700',
  },

  cardContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  },

  // Toggle Switch
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  toggleBtnTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },

  // Table styles
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  tableLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  tableValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtotalRow: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    borderRadius: 6,
    borderBottomWidth: 0,
    marginVertical: 4,
  },
  tableSubtotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  tableSubtotalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  finalRow: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderBottomWidth: 0,
    marginTop: 6,
  },
  tableFinalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  tableFinalValue: {
    fontSize: 16,
    fontWeight: '800',
  },
});
