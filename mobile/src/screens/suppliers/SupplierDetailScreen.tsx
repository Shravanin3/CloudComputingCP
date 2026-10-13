import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { recordPayment } from '../../services/suppliers/supplierService';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../constants/colors';

export const SupplierDetailScreen = ({ route, navigation }: any) => {
  const initialSupplier = route.params?.supplier;
  const [supplier, setSupplier] = useState(initialSupplier);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI'>('CASH');
  const [submitting, setSubmitting] = useState(false);

  const debt = Number(supplier?.payableBalance) || 0;

  const handlePayment = async () => {
    const amt = Number(paymentAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive payment amount.');
      return;
    }
    setSubmitting(true);
    try {
      await recordPayment(supplier.id, { amount: amt, paymentMethod });
      const newDebt = Math.max(0, debt - amt);
      Alert.alert(
        'Payment Recorded',
        `Successfully paid ₹${amt} via ${paymentMethod} to ${supplier.name}. Remaining payable: ₹${newDebt}.`
      );
      setSupplier((prev: any) => ({
        ...prev,
        payableBalance: newDebt,
      }));
      setPaymentAmount('');
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to record payment';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCall = () => {
    if (supplier?.phone) {
      Linking.openURL(`tel:${supplier.phone}`);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Supplier Hero Card */}
        <AppCard style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(supplier?.name || 'S').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.supplierName}>{supplier?.name}</Text>
              <Text style={styles.supplierPhone}>
                {supplier?.phone ? `📱 ${supplier.phone}` : 'No phone recorded'}
              </Text>
              <Text style={styles.supplierId}>ID: #{supplier?.id?.slice(0, 8)}</Text>
            </View>
          </View>

          {/* Debt Status Banner */}
          <View
            style={[
              styles.debtBanner,
              debt > 0 ? styles.debtBannerDue : styles.debtBannerClear,
            ]}
          >
            <View>
              <Text
                style={[
                  styles.debtLabel,
                  debt > 0 ? { color: '#991B1B' } : { color: '#065F46' },
                ]}
              >
                {debt > 0 ? 'Payable Supplier Debt' : 'Account Status'}
              </Text>
              <Text
                style={[
                  styles.debtAmount,
                  debt > 0 ? { color: '#DC2626' } : { color: '#047857' },
                ]}
              >
                {debt > 0 ? `₹${debt.toLocaleString()}` : 'All Debts Settled ✓'}
              </Text>
            </View>
            <View
              style={[
                styles.statusPill,
                debt > 0 ? { backgroundColor: '#FEE2E2' } : { backgroundColor: '#A7F3D0' },
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  debt > 0 ? { color: '#991B1B' } : { color: '#064E3B' },
                ]}
              >
                {debt > 0 ? 'PAYABLE' : 'CLEAR'}
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.heroActions}>
            {supplier?.phone ? (
              <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
                <Text style={styles.actionBtnText}>📞 Call Supplier</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate(ROUTES.EDIT_SUPPLIER, { supplier })}
            >
              <Text style={styles.actionBtnText}>✏️ Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </AppCard>

        {/* Pay Supplier Card */}
        <AppCard style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Pay Supplier / Vendor</Text>
          <Text style={styles.sectionSubtitle}>
            Records an outgoing payment and reduces vendor payable balance in DB.
          </Text>

          {/* Presets */}
          {debt > 0 && (
            <View style={styles.presetsRow}>
              {[500, 1000, 2000].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={styles.presetChip}
                  onPress={() => setPaymentAmount(preset.toString())}
                >
                  <Text style={styles.presetChipText}>+₹{preset}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.presetChip, styles.presetChipFull]}
                onPress={() => setPaymentAmount(debt.toString())}
              >
                <Text style={styles.presetChipFullText}>Full (₹{debt})</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Payment Amount Input */}
          <AppInput
            label="Payment Amount (₹) *"
            placeholder="e.g. 1000"
            value={paymentAmount}
            onChangeText={setPaymentAmount}
            keyboardType="numeric"
          />

          {/* Payment Method Selector */}
          <Text style={styles.inputLabel}>Payment Method</Text>
          <View style={styles.methodRow}>
            {(['CASH', 'UPI'] as const).map((method) => {
              const active = paymentMethod === method;
              return (
                <TouchableOpacity
                  key={method}
                  onPress={() => setPaymentMethod(method)}
                  style={[
                    styles.methodChip,
                    active ? styles.methodChipActive : styles.methodChipInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.methodChipText,
                      active ? styles.methodChipTextActive : styles.methodChipTextInactive,
                    ]}
                  >
                    {method === 'CASH' ? '💵 Cash Paid' : '📱 UPI / Bank'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ marginTop: 16 }}>
            <AppButton
              title="Record Payment to Supplier"
              variant="primary"
              loading={submitting}
              onPress={handlePayment}
            />
          </View>
        </AppCard>

        {/* Back Button */}
        <View style={{ marginTop: 14 }}>
          <AppButton
            title="← Back to Suppliers"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    padding: 16,
    marginBottom: 14,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  supplierName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  supplierPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  supplierId: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  debtBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
  },
  debtBannerDue: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  debtBannerClear: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  debtLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  debtAmount: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 9,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  paymentCard: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  presetChipFull: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.borderFocus,
  },
  presetChipFullText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 10,
  },
  methodChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  methodChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodChipInactive: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
  },
  methodChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  methodChipTextActive: {
    color: colors.textWhite,
  },
  methodChipTextInactive: {
    color: colors.textSecondary,
  },
});
