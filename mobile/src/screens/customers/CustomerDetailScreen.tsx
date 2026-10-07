import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { receivePayment } from '../../services/customers/customerService';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../constants/colors';

export const CustomerDetailScreen = ({ route, navigation }: any) => {
  const initialCustomer = route.params?.customer;
  const [customer, setCustomer] = useState(initialCustomer);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI'>('CASH');
  const [submitting, setSubmitting] = useState(false);

  const balance = Number(customer?.creditBalance) || 0;

  const handlePayment = async () => {
    const amt = Number(paymentAmount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive payment amount.');
      return;
    }
    setSubmitting(true);
    try {
      await receivePayment(customer.id, { amount: amt, paymentMethod });
      const newBal = Math.max(0, balance - amt);
      Alert.alert(
        'Payment Recorded',
        `Successfully received ₹${amt} via ${paymentMethod} from ${customer.name}. Remaining dues: ₹${newBal}.`
      );
      setCustomer((prev: any) => ({
        ...prev,
        creditBalance: newBal,
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
    if (customer?.phone) {
      Linking.openURL(`tel:${customer.phone}`);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Customer Profile Card */}
        <AppCard style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(customer?.name || 'C').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.customerName}>{customer?.name}</Text>
              <Text style={styles.customerPhone}>📱 {customer?.phone}</Text>
              <Text style={styles.customerId}>ID: #{customer?.id?.slice(0, 8)}</Text>
            </View>
          </View>

          {/* Balance Status Banner */}
          <View
            style={[
              styles.balanceBanner,
              balance > 0 ? styles.balanceBannerDue : styles.balanceBannerClear,
            ]}
          >
            <View>
              <Text
                style={[
                  styles.balanceLabel,
                  balance > 0 ? { color: '#92400E' } : { color: '#065F46' },
                ]}
              >
                {balance > 0 ? 'Outstanding Khata / Udhaar' : 'Khata Status'}
              </Text>
              <Text
                style={[
                  styles.balanceAmount,
                  balance > 0 ? { color: '#B45309' } : { color: '#047857' },
                ]}
              >
                {balance > 0 ? `₹${balance.toLocaleString()}` : 'No Dues Pending ✓'}
              </Text>
            </View>
            <View
              style={[
                styles.statusPill,
                balance > 0 ? { backgroundColor: '#FDE68A' } : { backgroundColor: '#A7F3D0' },
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  balance > 0 ? { color: '#78350F' } : { color: '#064E3B' },
                ]}
              >
                {balance > 0 ? 'DUE' : 'CLEAR'}
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
              <Text style={styles.actionBtnText}>📞 Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate(ROUTES.EDIT_CUSTOMER, { customer })}
            >
              <Text style={styles.actionBtnText}>✏️ Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </AppCard>

        {/* Receive Payment / Settle Khata Card */}
        <AppCard style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Receive Khata Payment</Text>
          <Text style={styles.sectionSubtitle}>
            Directly updates customer balance in PostgreSQL database.
          </Text>

          {/* Quick Amount Preset Chips */}
          {balance > 0 && (
            <View style={styles.presetsRow}>
              {[100, 500, 1000].map((preset) => (
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
                onPress={() => setPaymentAmount(balance.toString())}
              >
                <Text style={styles.presetChipFullText}>Full (₹{balance})</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Payment Amount Input */}
          <AppInput
            label="Payment Amount (₹) *"
            placeholder="e.g. 500"
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
                    {method === 'CASH' ? '💵 Cash Received' : '📱 UPI / QR'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ marginTop: 16 }}>
            <AppButton
              title="Record Payment & Settle"
              variant="success"
              loading={submitting}
              onPress={handlePayment}
            />
          </View>
        </AppCard>

        {/* Back Button */}
        <View style={{ marginTop: 14 }}>
          <AppButton
            title="← Back to Customers"
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
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  customerPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  customerId: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  balanceBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
  },
  balanceBannerDue: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  balanceBannerClear: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
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
