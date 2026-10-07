import React from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { deleteProduct } from '../../services/products/productService';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../constants/colors';

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const product = route.params?.product;

  if (!product) {
    return (
      <ScreenContainer style={{ padding: 16 }}>
        <AppCard style={{ alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 16 }}>
            Product details not available.
          </Text>
          <AppButton title="Return to Products" onPress={() => navigation.goBack()} />
        </AppCard>
      </ScreenContainer>
    );
  }

  const sellingPrice = Number(product.sellingPrice ?? product.price ?? 0);
  const costPrice = Number(product.costPrice ?? 0);
  const profitMargin = sellingPrice > 0 ? sellingPrice - costPrice : 0;
  const marginPercentage =
    sellingPrice > 0 ? Math.round((profitMargin / sellingPrice) * 100) : 0;
  const stock = Number(product.stock ?? product.initialStock ?? 0);
  const isLowStock = stock <= 10;

  const handleDelete = () => {
    Alert.alert(
      'Deactivate Product',
      `Are you sure you want to deactivate "${product.name}"? It will no longer appear in new billing.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              Alert.alert('Success', 'Product deactivated successfully.');
              navigation.goBack();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to deactivate product');
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Product Hero Card */}
        <AppCard style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.iconCircle}>
              <Text style={{ fontSize: 26 }}>📦</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.skuText}>
                SKU: {product.sku || 'N/A'} • ID: #{product.id?.slice(0, 8)}
              </Text>
              {product.category ? (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{product.category}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </AppCard>

        {/* Pricing & Margins Card */}
        <AppCard style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Financials & Margin Analysis</Text>

          <View style={styles.financialRow}>
            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Selling Price</Text>
              <Text style={[styles.financialValue, { color: colors.primary }]}>
                ₹{sellingPrice}
              </Text>
            </View>

            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Cost Price</Text>
              <Text style={[styles.financialValue, { color: colors.textSecondary }]}>
                ₹{costPrice > 0 ? costPrice : '—'}
              </Text>
            </View>

            <View style={styles.financialItem}>
              <Text style={styles.financialLabel}>Gross Margin</Text>
              <Text style={[styles.financialValue, { color: colors.success }]}>
                {marginPercentage > 0 ? `${marginPercentage}%` : '—'}
              </Text>
            </View>
          </View>
        </AppCard>

        {/* Inventory Stock Status */}
        <AppCard style={styles.sectionCard}>
          <View style={styles.stockHeader}>
            <Text style={styles.sectionHeading}>Inventory Status</Text>
            <View
              style={[
                styles.stockStatusBadge,
                isLowStock ? styles.stockStatusLow : styles.stockStatusGood,
              ]}
            >
              <Text
                style={[
                  styles.stockStatusText,
                  isLowStock ? { color: '#991B1B' } : { color: '#065F46' },
                ]}
              >
                {isLowStock ? 'Low Stock Warning' : 'Healthy Stock'}
              </Text>
            </View>
          </View>

          <View style={styles.stockCountRow}>
            <Text style={styles.stockCountNumber}>{stock}</Text>
            <Text style={styles.stockCountUnits}>units available in warehouse</Text>
          </View>

          <View style={{ marginTop: 12 }}>
            <AppButton
              title="⚡ Update Stock in Inventory"
              variant="outline"
              size="sm"
              onPress={() => navigation.navigate(ROUTES.INVENTORY)}
            />
          </View>
        </AppCard>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <AppButton
            title="✏️ Edit Product Details"
            variant="primary"
            onPress={() => navigation.navigate(ROUTES.EDIT_PRODUCT, { product })}
            style={{ marginBottom: 10 }}
          />
          <AppButton
            title="🗑️ Deactivate Product"
            variant="danger"
            onPress={handleDelete}
            style={{ marginBottom: 10 }}
          />
          <AppButton
            title="← Back to Catalog"
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
    marginBottom: 12,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  skuText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionCard: {
    padding: 16,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  financialItem: {
    flex: 1,
  },
  financialLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  financialValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockStatusLow: {
    backgroundColor: '#FEE2E2',
  },
  stockStatusGood: {
    backgroundColor: '#D1FAE5',
  },
  stockStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stockCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 10,
    gap: 8,
  },
  stockCountNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  stockCountUnits: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  actionsContainer: {
    marginTop: 8,
  },
});
