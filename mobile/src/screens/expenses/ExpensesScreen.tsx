import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { getExpenses } from '../../services/expenses/expenseService';
import { Expense } from '../../types/expense';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../constants/colors';

const CATEGORY_COLORS: Record<string, string> = {
  Rent: '#EF4444',
  Electricity: '#F59E0B',
  Utilities: '#EAB308',
  Supplies: '#3B82F6',
  'Tea & Snacks': '#10B981',
  'Staff Salary': '#8B5CF6',
  Transport: '#06B6D4',
  Repair: '#EC4899',
  Other: '#64748B',
};

export const ExpensesScreen = () => {
  const navigation = useNavigation<any>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const uniqueCategories = useMemo(() => {
    const cats = Array.from(new Set(expenses.map((e) => e.category).filter(Boolean)));
    return ['ALL', ...cats];
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchCat = selectedCategory === 'ALL' || e.category === selectedCategory;
      const descMatch = (e.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const catMatch = (e.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && (descMatch || catMatch);
    });
  }, [expenses, selectedCategory, searchQuery]);

  // Aggregation for chart
  const chartData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      const cat = e.category || 'Other';
      map[cat] = (map[cat] || 0) + Number(e.amount || 0);
    });

    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return entries.slice(0, 5).map(([name, amount], index) => {
      const color = CATEGORY_COLORS[name] || '#6366F1';
      return {
        name,
        amount,
        color,
        legendFontColor: colors.textSecondary,
        legendFontSize: 12,
      };
    });
  }, [expenses]);

  const chartWidth = Math.min(Dimensions.get('window').width - 48, 620);

  if (loading) return <LoadingState message="Loading expenses..." />;

  return (
    <ScreenContainer style={{ padding: 16 }}>
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Expense Tracker</Text>
          <Text style={styles.subtitle}>{expenses.length} Total expenses logged</Text>
        </View>
        <AppButton
          title="+ Add Expense"
          variant="primary"
          size="sm"
          onPress={() => navigation.navigate(ROUTES.ADD_EXPENSE)}
        />
      </View>

      {/* Total Banner */}
      <AppCard style={styles.totalCard}>
        <View style={styles.totalHeader}>
          <Text style={styles.totalLabel}>Total Expenses Recorded</Text>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>Debit</Text>
          </View>
        </View>
        <Text style={styles.totalAmount}>₹{totalExpenses.toLocaleString()}</Text>
      </AppCard>

      {/* Chart */}
      {expenses.length > 0 && totalExpenses > 0 && chartData.length > 0 && (
        <AppCard style={styles.chartCard}>
          <Text style={styles.chartTitle}>Top Expense Categories</Text>
          <PieChart
            data={chartData}
            width={chartWidth}
            height={160}
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
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
          placeholder="Search by category or description..."
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

      {/* Category Pills */}
      {uniqueCategories.length > 1 && (
        <View style={styles.filterRow}>
          {uniqueCategories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
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
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <EmptyState message="No expense records match your criteria." />
      ) : (
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => {
            const dateStr = item.date || item.expenseDate
              ? new Date(item.date || item.expenseDate!).toLocaleDateString()
              : '';
            const catColor = CATEGORY_COLORS[item.category] || colors.primary;

            return (
              <AppCard style={styles.expenseCard}>
                <View style={styles.expenseRow}>
                  <View style={[styles.categoryPill, { backgroundColor: `${catColor}15` }]}>
                    <Text style={[styles.categoryPillText, { color: catColor }]}>
                      {item.category}
                    </Text>
                  </View>
                  <Text style={styles.expenseAmount}>-₹{item.amount}</Text>
                </View>

                {item.description ? (
                  <Text style={styles.expenseDesc}>{item.description}</Text>
                ) : null}

                <View style={styles.expenseFooter}>
                  <Text style={styles.expenseDate}>🗓 {dateStr}</Text>
                  <Text style={styles.expenseId}>ID: #{item.id.slice(0, 8)}</Text>
                </View>
              </AppCard>
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
  totalCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    marginBottom: 14,
  },
  totalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  totalBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: 6,
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
    marginBottom: 10,
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
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
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
  expenseCard: {
    marginBottom: 10,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  expenseAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#DC2626',
  },
  expenseDesc: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSubtle,
    paddingTop: 8,
    marginTop: 4,
  },
  expenseDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  expenseId: {
    fontSize: 11,
    color: colors.textMuted,
  },
});