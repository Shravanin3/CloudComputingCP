import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { getCustomers } from '../../services/customers/customerService';
import { Customer } from '../../types/customer';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../constants/colors';

export const CustomersScreen = () => {
  const navigation = useNavigation<any>();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [onlyWithCredit, setOnlyWithCredit] = useState(false);

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

  if (loading) return <LoadingState message="Loading customer ledgers..." />;

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    const matchesQuery =
      c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q));
    const hasCredit = (Number(c.creditBalance) || 0) > 0;
    return matchesQuery && (onlyWithCredit ? hasCredit : true);
  });

  const totalUdhaar = customers.reduce(
    (sum, c) => sum + (Number(c.creditBalance) || 0),
    0
  );

  return (
    <ScreenContainer style={{ padding: 16 }}>
      {/* HEADER BANNER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Customer Accounts</Text>
          <Text style={styles.subtitle}>Track customer credit & Udhaar balance</Text>
        </View>
        <AppButton
          title="+ Add Customer"
          size="sm"
          onPress={() => navigation.navigate(ROUTES.ADD_CUSTOMER)}
        />
      </View>

      {/* TOTAL UDHAAR KPI CARD */}
      <AppCard style={styles.kpiBanner}>
        <Text style={styles.kpiLabel}>Total Customer Udhaar (Owed to You)</Text>
        <Text style={styles.kpiValue}>₹{totalUdhaar.toLocaleString('en-IN')}</Text>
        <Text style={styles.kpiSub}>Across {customers.length} registered customers</Text>
      </AppCard>

      {/* SEARCH AND FILTERS */}
      <View style={styles.searchBar}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput
          placeholder="Search customer by name or phone..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: colors.textMuted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, !onlyWithCredit && styles.filterChipActive]}
          onPress={() => setOnlyWithCredit(false)}
        >
          <Text
            style={[
              styles.filterChipText,
              !onlyWithCredit && styles.filterChipTextActive,
            ]}
          >
            All ({customers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, onlyWithCredit && styles.filterChipActiveWarning]}
          onPress={() => setOnlyWithCredit(true)}
        >
          <Text
            style={[
              styles.filterChipText,
              onlyWithCredit && { color: '#B45309', fontWeight: '700' },
            ]}
          >
            Has Pending Udhaar
          </Text>
        </TouchableOpacity>
      </View>

      {/* CUSTOMER LIST */}
      {filteredCustomers.length === 0 ? (
        <EmptyState message="No matching customers found." />
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const balance = Number(item.creditBalance) || 0;
            const hasCredit = balance > 0;

            return (
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.CUSTOMER_DETAIL, { customer: item })}
                activeOpacity={0.8}
              >
                <AppCard style={styles.customerCard}>
                  <View style={styles.cardContent}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {item.name ? item.name[0].toUpperCase() : 'C'}
                      </Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.customerName}>{item.name}</Text>
                      <Text style={styles.customerPhone}>📞 {item.phone}</Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.balanceLabel}>Udhaar Balance</Text>
                      <Text
                        style={[
                          styles.balanceValue,
                          { color: hasCredit ? colors.warning : colors.success },
                        ]}
                      >
                        ₹{balance.toLocaleString('en-IN')}
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

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  kpiBanner: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#B45309',
    marginVertical: 4,
  },
  kpiSub: {
    fontSize: 12,
    color: '#A16207',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },

  filterRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterChipActiveWarning: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warning,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },

  customerCard: {
    padding: 14,
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.primary,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  customerPhone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  balanceLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
});