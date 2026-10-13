import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  ModernTrendBarChart,
  ModernBezierLineChart,
  ModernPieChartCard,
} from '../../components/charts/ModernCharts';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { getDashboardSummary } from '../../services/dashboard/dashboardService';
import { DashboardSummary } from '../../types/dashboard';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../navigation/AuthContext';
import { colors } from '../../constants/colors';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user, tenant } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<'LINE' | 'BAR'>('LINE');

  const fetchDashboard = async () => {
    try {
      setError(null);
      const res = await getDashboardSummary();
      setData(res);
    } catch (err: any) {
      setError(err?.userMessage || err?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) return <LoadingState message="Loading financial overview..." />;
  if (error || !data) return <ErrorState message={error || 'No data available'} onRetry={fetchDashboard} />;

  // Metrics extraction with safe fallbacks
  const todaySales = data.todayMetrics?.totalSales ?? data.totalSales ?? 0;
  const cashCollected = data.todayMetrics?.cashCollected ?? data.cashReceived ?? 0;
  const upiCollected = data.todayMetrics?.upiCollected ?? 0;
  const creditGiven = data.todayMetrics?.creditGiven ?? 0;
  const pendingCredit = data.operationalAlerts?.totalPendingCredit ?? data.pendingCredit ?? 0;
  const todayExpenses = data.todayMetrics?.totalExpenses ?? data.expenses ?? 0;
  const lowStockCount = data.operationalAlerts?.lowStockCount ?? data.lowStockItems ?? 0;

  const todayInflowData = [
    { name: 'Cash', population: cashCollected, color: '#10B981' },
    { name: 'UPI', population: upiCollected, color: '#3B82F6' },
    { name: 'Udhaar', population: creditGiven, color: '#F59E0B' },
  ];
  const hasInflowData = cashCollected > 0 || upiCollected > 0 || creditGiven > 0;

  // Screen width for responsive chart (capped for web screens)
  const windowWidth = Dimensions.get('window').width;
  const chartWidth = Math.min(windowWidth - 32, 650);

  // Chart data extraction
  const weekly = data.weeklyTrend && data.weeklyTrend.length > 0 ? data.weeklyTrend : [];
  const chartLabels = weekly.length > 0
    ? weekly.map((w) => {
        const parts = w.date.split('-');
        return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : w.date;
      })
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const salesTrendData = weekly.length > 0
    ? weekly.map((w) => Number(w.sales) || 0)
    : [0, 0, 0, 0, 0, 0, 0];

  const hasSalesActivity = salesTrendData.some((v) => v > 0);

  const quickActions = [
    { title: 'New Bill / POS', desc: 'Fast checkout & billing', route: ROUTES.NEW_BILL, icon: '⚡', bg: '#4F46E5', textBg: '#EEF2FF' },
    { title: 'Products', desc: 'Items & selling prices', route: ROUTES.PRODUCTS, icon: '📦', bg: '#0284C7', textBg: '#E0F2FE' },
    { title: 'Inventory', desc: `${lowStockCount > 0 ? `${lowStockCount} low stock` : 'Track stocks'}`, route: ROUTES.INVENTORY, icon: '📊', bg: lowStockCount > 0 ? '#DC2626' : '#059669', textBg: lowStockCount > 0 ? '#FEE2E2' : '#D1FAE5' },
    { title: 'Sales History', desc: 'Past receipts & orders', route: ROUTES.SALES, icon: '🧾', bg: '#7C3AED', textBg: '#EDE9FE' },
    { title: 'Customers', desc: 'Udhaar & credit ledgers', route: ROUTES.CUSTOMERS, icon: '👥', bg: '#D97706', textBg: '#FEF3C7' },
    { title: 'Suppliers', desc: 'Distributor payables', route: ROUTES.SUPPLIERS, icon: '🚚', bg: '#EA580C', textBg: '#FFEDD5' },
    { title: 'Expenses', desc: 'Shop overhead costs', route: ROUTES.EXPENSES, icon: '💸', bg: '#BE123C', textBg: '#FFE4E6' },
    { title: 'Reports', desc: 'P&L and Sales trends', route: ROUTES.REPORTS, icon: '📈', bg: '#0D9488', textBg: '#CCFBF1' },
  ];

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* HEADER GREETING BANNER */}
        <View style={styles.headerBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.storeName}>{tenant?.shopName || 'MSME Retail Store'}</Text>
            <Text style={styles.greeting}>
              Welcome back, <Text style={styles.ownerName}>{user?.name || 'Store Owner'}</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileBadge}
            onPress={() => navigation.navigate(ROUTES.SETTINGS)}
            activeOpacity={0.8}
          >
            <Text style={styles.profileInitial}>{(user?.name || 'S')[0].toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* OPERATIONAL ALERT BANNER (IF LOW STOCK) */}
        {lowStockCount > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => navigation.navigate(ROUTES.INVENTORY)}
            activeOpacity={0.85}
          >
            <View style={styles.alertIconBadge}>
              <Text style={{ fontSize: 16 }}>⚠️</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.alertTitle}>{lowStockCount} Products Low on Stock</Text>
              <Text style={styles.alertSubtitle}>Tap to restock before shelves run out</Text>
            </View>
            <Text style={styles.alertActionText}>Restock ➔</Text>
          </TouchableOpacity>
        )}

        {/* 2X2 METRIC KPI CARDS */}
        <Text style={styles.sectionHeader}>Today's Performance</Text>
        <View style={styles.kpiGrid}>
          {/* Today's Sales */}
          <View style={[styles.kpiCard, { borderLeftColor: colors.primary }]}>
            <Text style={styles.kpiLabel}>Today's Sales</Text>
            <Text style={styles.kpiValue}>₹{todaySales.toLocaleString('en-IN')}</Text>
            <View style={[styles.kpiBadge, { backgroundColor: colors.successBg }]}>
              <Text style={[styles.kpiBadgeText, { color: colors.success }]}>● Live revenue</Text>
            </View>
          </View>

          {/* Cash Received */}
          <View style={[styles.kpiCard, { borderLeftColor: colors.success }]}>
            <Text style={styles.kpiLabel}>Cash Collected</Text>
            <Text style={[styles.kpiValue, { color: colors.success }]}>₹{cashCollected.toLocaleString('en-IN')}</Text>
            <View style={[styles.kpiBadge, { backgroundColor: colors.infoBg }]}>
              <Text style={[styles.kpiBadgeText, { color: colors.info }]}>Cash in drawer</Text>
            </View>
          </View>

          {/* Pending Udhaar / Credit */}
          <View style={[styles.kpiCard, { borderLeftColor: colors.warning }]}>
            <Text style={styles.kpiLabel}>Udhaar (Credit)</Text>
            <Text style={[styles.kpiValue, { color: colors.warning }]}>₹{pendingCredit.toLocaleString('en-IN')}</Text>
            <View style={[styles.kpiBadge, { backgroundColor: colors.warningBg }]}>
              <Text style={[styles.kpiBadgeText, { color: colors.warning }]}>Owed by customers</Text>
            </View>
          </View>

          {/* Today's Expenses */}
          <View style={[styles.kpiCard, { borderLeftColor: colors.danger }]}>
            <Text style={styles.kpiLabel}>Expenses</Text>
            <Text style={[styles.kpiValue, { color: colors.danger }]}>₹{todayExpenses.toLocaleString('en-IN')}</Text>
            <View style={[styles.kpiBadge, { backgroundColor: colors.dangerBg }]}>
              <Text style={[styles.kpiBadgeText, { color: colors.danger }]}>Today's outflow</Text>
            </View>
          </View>
        </View>

        {/* 7-DAY REVENUE PERFORMANCE GRAPH */}
        <AppCard style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.chartTitle}>7-Day Sales Trend</Text>
              <Text style={styles.chartSubtitle}>
                {chartMode === 'LINE' ? 'Smooth revenue trajectory (₹)' : 'Daily sales volume bars (₹)'}
              </Text>
            </View>

            {/* View Mode Switcher */}
            <View style={styles.chartToggleGroup}>
              <TouchableOpacity
                style={[styles.chartToggleBtn, chartMode === 'LINE' && styles.chartToggleBtnActive]}
                onPress={() => setChartMode('LINE')}
              >
                <Text style={[styles.chartToggleText, chartMode === 'LINE' && styles.chartToggleTextActive]}>
                  📈 Line
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chartToggleBtn, chartMode === 'BAR' && styles.chartToggleBtnActive]}
                onPress={() => setChartMode('BAR')}
              >
                <Text style={[styles.chartToggleText, chartMode === 'BAR' && styles.chartToggleTextActive]}>
                  📊 Bar
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {chartMode === 'LINE' ? (
            <ModernBezierLineChart
              labels={chartLabels}
              data={salesTrendData}
              width={chartWidth - 28}
              height={195}
              primaryLabel="Sales (₹)"
              primaryColor="#4F46E5"
            />
          ) : (
            <ModernTrendBarChart
              labels={chartLabels}
              data={salesTrendData}
              height={190}
              barColor={colors.primary}
            />
          )}

          <TouchableOpacity
            style={styles.fullReportsLink}
            onPress={() => navigation.navigate(ROUTES.REPORTS)}
          >
            <Text style={styles.fullReportsText}>View Complete Financial P&L Reports ➔</Text>
          </TouchableOpacity>
        </AppCard>

        {/* TODAY'S INFLOW PAYMENT DISTRIBUTION PIE */}
        {hasInflowData && (
          <AppCard style={styles.chartCard}>
            <ModernPieChartCard
              title="Today's Payment Channels"
              subtitle="Cash vs UPI vs Credit given today"
              data={todayInflowData}
              width={chartWidth - 28}
              height={180}
            />
          </AppCard>
        )}

        {/* QUICK ACTIONS GRID */}
        <Text style={styles.sectionHeader}>Business Modules</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.route)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: action.textBg }]}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDesc} numberOfLines={1}>
                  {action.desc}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* BOTTOM QUICK POS BUTTON */}
        <TouchableOpacity
          style={styles.posFloatingBanner}
          onPress={() => navigation.navigate(ROUTES.NEW_BILL)}
          activeOpacity={0.9}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginRight: 10 }}>⚡</Text>
            <View>
              <Text style={styles.posBannerTitle}>Quick POS Checkout</Text>
              <Text style={styles.posBannerSubtitle}>Scan products or create invoice bill</Text>
            </View>
          </View>
          <Text style={styles.posBannerArrow}>Open ➔</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 4,
  },
  storeName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ownerName: {
    fontWeight: '700',
    color: colors.primary,
  },
  profileBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  profileInitial: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },

  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  alertIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    fontWeight: '700',
    color: '#991B1B',
    fontSize: 14,
  },
  alertSubtitle: {
    color: '#B91C1C',
    fontSize: 12,
    marginTop: 1,
  },
  alertActionText: {
    fontWeight: '700',
    color: '#DC2626',
    fontSize: 13,
  },

  sectionHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginTop: 4,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
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
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 6,
    marginBottom: 8,
  },
  kpiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  kpiBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  chartCard: {
    padding: 14,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chartSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chartActionLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  chartToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  chartToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chartToggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  chartToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chartToggleTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  fullReportsLink: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  fullReportsText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  chartStyle: {
    marginVertical: 4,
    borderRadius: 10,
    alignSelf: 'center',
  },
  chartEmptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  chartEmptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  chartEmptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 320,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.textPrimary,
  },
  actionDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },

  posFloatingBanner: {
    backgroundColor: colors.secondary,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  posBannerTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  posBannerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  posBannerArrow: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 15,
  },
});
