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
import { getSuppliers } from '../../services/suppliers/supplierService';
import { Supplier } from '../../types/supplier';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../constants/colors';

export const SuppliersScreen = () => {
  const navigation = useNavigation<any>();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [onlyWithPayable, setOnlyWithPayable] = useState(false);

  const fetchSuppliers = async () => {
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } catch (e) {
      console.log('Error fetching suppliers:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSuppliers();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchSuppliers();
  };

  if (loading) return <LoadingState message="Loading suppliers & distributors..." />;

  const filteredSuppliers = suppliers.filter((s) => {
    const q = search.toLowerCase();
    const matchesQuery =
      s.name.toLowerCase().includes(q) || (s.phone && s.phone.includes(q));
    const hasPayable = (Number(s.payableBalance) || 0) > 0;
    return matchesQuery && (onlyWithPayable ? hasPayable : true);
  });

  const totalPayable = suppliers.reduce(
    (sum, s) => sum + (Number(s.payableBalance) || 0),
    0
  );

  return (
    <ScreenContainer style={{ padding: 16 }}>
      {/* HEADER BANNER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Suppliers & Vendors</Text>
          <Text style={styles.subtitle}>Track wholesale distributors and accounts payable</Text>
        </View>
        <AppButton
          title="+ Add Supplier"
          size="sm"
          onPress={() => navigation.navigate(ROUTES.ADD_SUPPLIER)}
        />
      </View>

      {/* TOTAL PAYABLE BANNER */}
      <AppCard style={styles.kpiBanner}>
        <Text style={styles.kpiLabel}>Total Vendor Payables (Debt Owed)</Text>
        <Text style={styles.kpiValue}>₹{totalPayable.toLocaleString('en-IN')}</Text>
        <Text style={styles.kpiSub}>Across {suppliers.length} FMCG distributors</Text>
      </AppCard>

      {/* SEARCH AND FILTERS */}
      <View style={styles.searchBar}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
        <TextInput
          placeholder="Search supplier by name or phone..."
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
          style={[styles.filterChip, !onlyWithPayable && styles.filterChipActive]}
          onPress={() => setOnlyWithPayable(false)}
        >
          <Text
            style={[
              styles.filterChipText,
              !onlyWithPayable && styles.filterChipTextActive,
            ]}
          >
            All Vendors ({suppliers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, onlyWithPayable && styles.filterChipActiveDanger]}
          onPress={() => setOnlyWithPayable(true)}
        >
          <Text
            style={[
              styles.filterChipText,
              onlyWithPayable && { color: '#991B1B', fontWeight: '700' },
            ]}
          >
            Has Pending Dues
          </Text>
        </TouchableOpacity>
      </View>

      {/* SUPPLIERS LIST */}
      {filteredSuppliers.length === 0 ? (
        <EmptyState message="No matching suppliers found." />
      ) : (
        <FlatList
          data={filteredSuppliers}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item }) => {
            const payable = Number(item.payableBalance) || 0;
            const hasPayable = payable > 0;

            return (
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.SUPPLIER_DETAIL, { supplier: item })}
                activeOpacity={0.8}
              >
                <AppCard style={styles.supplierCard}>
                  <View style={styles.cardContent}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {item.name ? item.name[0].toUpperCase() : 'S'}
                      </Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.supplierName}>{item.name}</Text>
                      {item.phone && (
                        <Text style={styles.supplierPhone}>📞 {item.phone}</Text>
                      )}
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.balanceLabel}>Payable Debt</Text>
                      <Text
                        style={[
                          styles.balanceValue,
                          { color: hasPayable ? colors.danger : colors.success },
                        ]}
                      >
                        ₹{payable.toLocaleString('en-IN')}
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
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#991B1B',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#DC2626',
    marginVertical: 4,
  },
  kpiSub: {
    fontSize: 12,
    color: '#B91C1C',
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
  filterChipActiveDanger: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.danger,
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

  supplierCard: {
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
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '800',
    fontSize: 16,
    color: '#D97706',
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  supplierPhone: {
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