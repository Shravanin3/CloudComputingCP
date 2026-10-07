import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { Sale } from '../../types/sales';
import { colors } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';

export const SaleDetailScreen = ({ route, navigation }: any) => {
  const sale: Sale = route.params?.sale;

  if (!sale) {
    return (
      <ScreenContainer style={{ padding: 16 }}>
        <AppCard style={{ alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 16 }}>
            Sale details could not be found.
          </Text>
          <AppButton title="Return to Sales" onPress={() => navigation.goBack()} />
        </AppCard>
      </ScreenContainer>
    );
  }

  const customerName =
    typeof sale.customer === 'object' && sale.customer?.name
      ? sale.customer.name
      : typeof sale.customer === 'string'
      ? sale.customer
      : 'Walk-in Customer';

  const customerPhone =
    typeof sale.customer === 'object' && sale.customer?.phone
      ? sale.customer.phone
      : null;

  const dateStr = sale.saleDate ? new Date(sale.saleDate).toLocaleString() : '';

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

  const badge = getBadgeStyle(sale.paymentMethod);

  const handleShareInvoice = () => {
    Alert.alert(
      'Digital Invoice Ready',
      `Invoice #${sale.id.slice(0, 8).toUpperCase()} for ₹${sale.totalAmount} has been generated.\nCustomer: ${customerName}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header Hero Card */}
        <AppCard style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Tax Invoice</Text>
              <Text style={styles.invoiceNumber}>#{sale.id.slice(0, 10).toUpperCase()}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
              <Text style={[styles.badgeText, { color: badge.text }]}>{sale.paymentMethod}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date & Time</Text>
            <Text style={styles.metaValue}>{dateStr}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Payment Status</Text>
            <Text style={[styles.metaValue, { color: colors.success, fontWeight: '700' }]}>
              {sale.paymentMethod === 'CREDIT' ? 'Khata / Udhaar' : 'Paid in Full'}
            </Text>
          </View>
        </AppCard>

        {/* Customer Info Card */}
        <AppCard style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Customer Details</Text>
          <View style={styles.customerRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{customerName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.customerName}>{customerName}</Text>
              {customerPhone ? (
                <Text style={styles.customerPhone}>📞 {customerPhone}</Text>
              ) : (
                <Text style={styles.customerPhone}>Unregistered Walk-in</Text>
              )}
            </View>
          </View>
        </AppCard>

        {/* Line Items Card */}
        <AppCard style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>
            Purchased Items ({sale.saleItems?.length || 0})
          </Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableCol, { flex: 2 }]}>Item</Text>
            <Text style={[styles.tableCol, { flex: 1, textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.tableCol, { flex: 1, textAlign: 'right' }]}>Rate</Text>
            <Text style={[styles.tableCol, { flex: 1.2, textAlign: 'right' }]}>Total</Text>
          </View>

          {sale.saleItems?.map((item, idx) => {
            const prodName = item.product?.name || `Product #${idx + 1}`;
            const unitPrice = item.unitPrice || 0;
            const lineTotal = item.lineTotal ?? unitPrice * item.quantity;

            return (
              <View key={item.id || idx} style={styles.tableRow}>
                <Text style={[styles.itemText, { flex: 2 }]} numberOfLines={2}>
                  {prodName}
                </Text>
                <Text style={[styles.itemText, { flex: 1, textAlign: 'center', color: colors.textSecondary }]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.itemText, { flex: 1, textAlign: 'right', color: colors.textSecondary }]}>
                  ₹{unitPrice}
                </Text>
                <Text style={[styles.itemTextBold, { flex: 1.2, textAlign: 'right' }]}>
                  ₹{lineTotal}
                </Text>
              </View>
            );
          })}

          <View style={styles.divider} />

          {/* Pricing Totals */}
          {sale.taxAmount ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalSubLabel}>GST / Tax</Text>
              <Text style={styles.totalSubVal}>₹{sale.taxAmount}</Text>
            </View>
          ) : null}

          <View style={styles.grandTotalContainer}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>₹{sale.totalAmount}</Text>
          </View>
        </AppCard>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <AppButton
            title="📄 Share Digital Receipt"
            variant="outline"
            onPress={handleShareInvoice}
            style={{ marginBottom: 10 }}
          />
          <AppButton
            title="← Back to Sales"
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    marginBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  invoiceNumber: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metaLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  metaValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  sectionCard: {
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  customerPhone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 6,
    marginBottom: 8,
  },
  tableCol: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSubtle,
  },
  itemText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  itemTextBold: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalSubLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  totalSubVal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  grandTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  actionsContainer: {
    marginTop: 10,
  },
});