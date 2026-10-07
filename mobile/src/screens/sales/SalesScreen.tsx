import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Dimensions,
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { getSales } from '../../services/sales/salesService';
import { Sale } from '../../types/sales';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../constants/colors';

export const SalesScreen = () => {
  const navigation = useNavigation<any>();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'CASH' | 'UPI' | 'CREDIT'>('ALL');

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

  // Calculations
  const totalRevenue = useMemo(() => {
    return sales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  }, [sales]);

  const cashTotal = useMemo(() => {
    return sales
      .filter((s) => s.paymentMethod === 'CASH')
      .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  }, [sales]);

  const upiTotal = useMemo(() => {
    return sales
      .filter((s) => s.paymentMethod === 'UPI')
      .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  }, [sales]);

  const creditTotal = useMemo(() => {
    return sales
      .filter((s) => s.paymentMethod === 'CREDIT')
      .reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  }, [sales]);

  const avgTicket = sales.length > 0 ? Math.round(totalRevenue / sales.length) : 0;

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((item) => {
      const matchFilter = selectedFilter === 'ALL' || item.paymentMethod === selectedFilter;
      const custName =
        typeof item.customer === 'object' && item.customer?.name
          ? item.customer.name.toLowerCase()
          : typeof item.customer === 'string'
          ? item.customer.toLowerCase()
          : 'walk-in customer';
      const idMatch = item.id.toLowerCase().includes(searchQuery.toLowerCase());
      const nameMatch = custName.includes(searchQuery.toLowerCase());
      return matchFilter && (idMatch || nameMatch);
    });
  }, [sales, selectedFilter, searchQuery]);

  const getBadgeStyle = (method: string) => {
    switch (method) {
      case 'CASH':
        return { bg: colors.successBg, text: colors.success, border: colors.successBorder };
      case 'UPI':
        return { bg: colors.infoBg, text: colors.info, border: colors.infoBorder };
      case 'CREDIT':
        return { bg: colors.warningBg, text: colors.warning, border: colors.warningBorder };
      default:
        return { bg: colors.surfaceSubtle, text: colors.textSecondary, border: colors.border };
    }
  };

  const chartWidth = Math.min(Dimensions.get('window').width - 48, 620);

  const pieData = [
    {
      name: 'Cash',
      amount: cashTotal || 1,
      color: '#10B981',
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    },
    {
      name: 'UPI',
      amount: upiTotal || 1,
      color: '#3B82F6',
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    },
    {
      name: 'Udhaar',
      amount: creditTotal || 1,
      color: '#F59E0B',
      legendFontColor: colors.textSecondary,
      legendFontSize: 12,
    },
  ];

  if (loading) return <LoadingState message="Loading sales ledger..." />;

  return (
    <ScreenContainer style={{ padding: 16 }}>
      {/* Top Action & KPI Banner */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Sales Ledger</Text>
          <Text style={styles.subtitle}>{sales.length} Total transactions recorded</Text>
        </View>
        <AppButton
          title="+ New Bill"
          variant="primary"
          size="sm"
          onPress={() => navigation.navigate(ROUTES.NEW_BILL)}
        />
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        <AppCard style={[styles.kpiCard, { borderLeftColor: colors.primary, borderLeftWidth: 4 }]}>
          <Text style={styles.kpiLabel}>Total Revenue</Text>
          <Text style={[styles.kpiValue, { color: colors.primary }]}>₹{totalRevenue.toLocaleString()}</Text>
        </AppCard>
        <AppCard style={[styles.kpiCard, { borderLeftColor: colors.accent, borderLeftWidth: 4 }]}>
          <Text style={styles.kpiLabel}>Avg Bill Size</Text>
          <Text style={[styles.kpiValue, { color: colors.accent }]}>₹{avgTicket.toLocaleString()}</Text>
        </AppCard>
      </View>

      {/* Chart Section */}
      {sales.length > 0 && totalRevenue > 0 && (
        <AppCard style={styles.chartCard}>
          <Text style={styles.chartTitle}>Payment Method Breakdown</Text>
          <PieChart
            data={pieData}
            width={chartWidth}
            height={160}
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute={false}
          />
        </AppCard>
      )}

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by customer name or bill ID..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(['ALL', 'CASH', 'UPI', 'CREDIT'] as const).map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterChip,
                isActive ? styles.filterChipActive : styles.filterChipInactive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive ? styles.filterChipTextActive : styles.filterChipTextInactive,
                ]}
              >
                {filter === 'ALL' ? 'All Bills' : filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Transaction List */}
      {filteredSales.length === 0 ? (
        <EmptyState message="No matching sales records found." />
      ) : (
        <FlatList
          data={filteredSales}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const badge = getBadgeStyle(item.paymentMethod);
            const customerName =
              typeof item.customer === 'object' && item.customer?.name
                ? item.customer.name
                : typeof item.customer === 'string'
                ? item.customer
                : 'Walk-in Customer';
            const dateStr = item.saleDate ? new Date(item.saleDate).toLocaleString() : '';
            const itemCount = item.saleItems?.length || 0;

            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate(ROUTES.SALE_DETAIL, { sale: item })}
              >
                <AppCard style={styles.saleCard}>
                  <View style={styles.saleHeader}>
                    <View style={styles.customerInfo}>
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{customerName.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <Text style={styles.customerNameText} numberOfLines={1}>
                          {customerName}
                        </Text>
                        <Text style={styles.dateText}>{dateStr}</Text>
                      </View>
                    </View>

                    <View style={styles.amountContainer}>
                      <Text style={styles.amountText}>₹{item.totalAmount}</Text>
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: badge.bg,
                            borderColor: badge.border,
                          },
                        ]}
                      >
                        <Text style={[styles.badgeText, { color: badge.text }]}>
                          {item.paymentMethod}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.saleFooter}>
                    <Text style={styles.itemCountText}>
                      📦 {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </Text>
                    <Text style={styles.invoiceIdText}>
                      ID: #{item.id.slice(0, 8)}... →
                    </Text>
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

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  kpiLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  chartCard: {
    marginBottom: 14,
    alignItems: 'center',
    paddingVertical: 12,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.textPrimary,
  },
  clearBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.textWhite,
  },
  filterChipTextInactive: {
    color: colors.textSecondary,
  },
  saleCard: {
    marginBottom: 10,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 16,
  },
  customerNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  saleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    marginTop: 10,
    paddingTop: 8,
  },
  itemCountText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  invoiceIdText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
});