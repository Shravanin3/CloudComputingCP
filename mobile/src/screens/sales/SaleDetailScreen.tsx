import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { Sale } from '../../types/sales';

export const SaleDetailScreen = ({ route, navigation }: any) => {
  const sale: Sale = route.params?.sale;

  if (!sale) {
    return (
      <ScreenContainer style={{ padding: 16 }}>
        <Text>Sale not found.</Text>
        <AppButton title="Go Back" onPress={() => navigation.goBack()} />
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

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <ScrollView>
        <AppCard>
          <Text style={styles.title}>Invoice Summary</Text>
          <Text style={styles.meta}>Sale ID: {sale.id}</Text>
          <Text style={styles.meta}>Date: {dateStr}</Text>
          <Text style={styles.meta}>Payment: {sale.paymentMethod}</Text>
          <Text style={styles.meta}>Customer: {customerName}</Text>
          {customerPhone && <Text style={styles.meta}>Phone: {customerPhone}</Text>}
        </AppCard>

        <Text style={styles.sectionTitle}>Items</Text>
        {sale.saleItems?.map((item, idx) => {
          const prodName = item.product?.name || `Item ${idx + 1}`;
          const lineTotal = item.lineTotal ?? (item.unitPrice || 0) * item.quantity;

          return (
            <AppCard key={item.id || idx} style={{ marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 15 }}>{prodName}</Text>
                  <Text style={{ color: '#666', fontSize: 13 }}>
                    {item.quantity} x ₹{item.unitPrice || 0}
                  </Text>
                </View>
                <Text style={{ fontWeight: 'bold', fontSize: 16 }}>₹{lineTotal}</Text>
              </View>
            </AppCard>
          );
        })}

        <AppCard style={{ marginTop: 12 }}>
          {sale.taxAmount ? (
            <View style={styles.row}>
              <Text style={styles.label}>Tax:</Text>
              <Text style={styles.value}>₹{sale.taxAmount}</Text>
            </View>
          ) : null}
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 }]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>₹{sale.totalAmount}</Text>
          </View>
        </AppCard>

        <View style={{ marginVertical: 20 }}>
          <AppButton title="Back to Sales History" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  meta: { fontSize: 14, color: '#555', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 15, color: '#666' },
  value: { fontSize: 15, fontWeight: '600' },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#007AFF' },
});