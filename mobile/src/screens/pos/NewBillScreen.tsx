import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { LoadingState } from '../../components/common/LoadingState';
import { getProducts } from '../../services/products/productService';
import { getCustomers } from '../../services/customers/customerService';
import { createSale } from '../../services/sales/salesService';
import { Product } from '../../types/product';
import { Customer } from '../../types/customer';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../constants/colors';

export const NewBillScreen = () => {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CREDIT'>('CASH');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getProducts(), getCustomers()])
      .then(([prods, custs]) => {
        setProducts(prods);
        setCustomers(custs);
      })
      .catch((e) => console.log('Error loading POS:', e))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (product: Product) => {
    const availableStock = product.inventory?.stockQuantity ?? product.stock ?? 999;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= availableStock) {
          Alert.alert('Stock Limit', `Only ${availableStock} units available for ${product.name}`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const decrementQuantity = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === productId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((item) => item.product.id !== productId);
      }
      return prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const total = cart.reduce(
    (sum, item) => sum + (Number(item.product.sellingPrice) || 0) * item.quantity,
    0
  );

  const confirmSale = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add at least one product to the bill.');
      return;
    }
    if (paymentMethod === 'CREDIT' && !selectedCustomerId) {
      Alert.alert('Customer Required', 'Credit (Udhaar) sales require selecting a customer account.');
      return;
    }

    setSubmitting(true);
    try {
      await createSale({
        customerId: selectedCustomerId || undefined,
        paymentMethod,
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      });

      const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
      const customerText = selectedCustomer ? ` for ${selectedCustomer.name}` : '';

      Alert.alert(
        'Sale Completed!',
        `Recorded ₹${total.toLocaleString('en-IN')} ${paymentMethod} transaction${customerText}. Stock updated in database.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setCart([]);
              setSelectedCustomerId('');
              navigation.navigate(ROUTES.HOME);
            },
          },
        ]
      );
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to complete transaction';
      Alert.alert('Transaction Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading POS terminal..." />;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Point of Sale (POS)</Text>
          <Text style={styles.headerSubtitle}>Tap products to build bill & checkout</Text>
        </View>

        {/* SEARCH PRODUCT BAR */}
        <View style={styles.searchBar}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            placeholder="Search products by name or SKU..."
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

        {/* PRODUCTS CAROUSEL / GRID */}
        <Text style={styles.sectionTitle}>
          Catalog Products ({filteredProducts.length})
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.productsScroll}
        >
          {filteredProducts.map((p) => {
            const stock = p.inventory?.stockQuantity ?? p.stock ?? 0;
            const inCart = cart.find((c) => c.product.id === p.id);

            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.productPill, inCart && styles.productPillActive]}
                onPress={() => addToCart(p)}
                activeOpacity={0.8}
              >
                <View style={styles.productPillTop}>
                  <Text style={styles.productPillName} numberOfLines={1}>
                    {p.name}
                  </Text>
                  {p.sku && <Text style={styles.productPillSku}>{p.sku}</Text>}
                </View>
                <View style={styles.productPillBottom}>
                  <Text style={styles.productPillPrice}>₹{p.sellingPrice}</Text>
                  <Text style={[styles.productPillStock, stock <= 5 && { color: colors.danger }]}>
                    {stock} left
                  </Text>
                </View>
                {inCart && (
                  <View style={styles.inCartBadge}>
                    <Text style={styles.inCartBadgeText}>{inCart.quantity}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* CURRENT BILL / CART */}
        <AppCard style={styles.cartCard}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>Current Cart ({cart.length} items)</Text>
            {cart.length > 0 && (
              <TouchableOpacity onPress={() => setCart([])}>
                <Text style={styles.clearCartText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {cart.length === 0 ? (
            <View style={styles.emptyCartBox}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🛒</Text>
              <Text style={styles.emptyCartText}>Cart is currently empty</Text>
              <Text style={styles.emptyCartSub}>Select items from the catalog above</Text>
            </View>
          ) : (
            cart.map((item) => (
              <View key={item.product.id} style={styles.cartItemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cartItemName}>{item.product.name}</Text>
                  <Text style={styles.cartItemUnit}>
                    ₹{item.product.sellingPrice} each
                  </Text>
                </View>

                {/* QUANTITY CONTROLS */}
                <View style={styles.qtyControlBox}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => decrementQuantity(item.product.id)}
                  >
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => addToCart(item.product)}
                  >
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ width: 70, alignItems: 'flex-end' }}>
                  <Text style={styles.cartItemTotal}>
                    ₹{item.product.sellingPrice * item.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeFromCart(item.product.id)}
                    style={{ marginTop: 2 }}
                  >
                    <Text style={{ fontSize: 11, color: colors.danger }}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {/* BILL TOTAL */}
          {cart.length > 0 && (
            <View style={styles.billTotalRow}>
              <Text style={styles.billTotalLabel}>Grand Total</Text>
              <Text style={styles.billTotalValue}>₹{total.toLocaleString('en-IN')}</Text>
            </View>
          )}
        </AppCard>

        {/* CUSTOMER SELECTION */}
        <AppCard style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>Customer Account</Text>
          <Text style={styles.cardHeaderSubtitle}>
            Required for Credit (Udhaar) sales
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            {/* Walk-in option */}
            <TouchableOpacity
              style={[
                styles.customerChip,
                selectedCustomerId === '' && styles.customerChipActive,
              ]}
              onPress={() => setSelectedCustomerId('')}
            >
              <Text
                style={[
                  styles.customerChipText,
                  selectedCustomerId === '' && styles.customerChipTextActive,
                ]}
              >
                👤 Walk-in Customer
              </Text>
            </TouchableOpacity>

            {customers.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[
                  styles.customerChip,
                  selectedCustomerId === c.id && styles.customerChipActive,
                ]}
                onPress={() => setSelectedCustomerId(c.id)}
              >
                <Text
                  style={[
                    styles.customerChipText,
                    selectedCustomerId === c.id && styles.customerChipTextActive,
                  ]}
                >
                  {c.name} {c.creditBalance ? `(₹${c.creditBalance})` : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </AppCard>

        {/* PAYMENT METHOD CHIPS */}
        <AppCard style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>Payment Method</Text>

          <View style={styles.paymentMethodRow}>
            <TouchableOpacity
              style={[
                styles.paymentMethodBtn,
                paymentMethod === 'CASH' && styles.paymentMethodBtnActiveCash,
              ]}
              onPress={() => setPaymentMethod('CASH')}
            >
              <Text style={{ fontSize: 18 }}>💵</Text>
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod === 'CASH' && styles.paymentMethodTextActive,
                ]}
              >
                Cash
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethodBtn,
                paymentMethod === 'UPI' && styles.paymentMethodBtnActiveUpi,
              ]}
              onPress={() => setPaymentMethod('UPI')}
            >
              <Text style={{ fontSize: 18 }}>📱</Text>
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod === 'UPI' && styles.paymentMethodTextActive,
                ]}
              >
                UPI / QR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethodBtn,
                paymentMethod === 'CREDIT' && styles.paymentMethodBtnActiveCredit,
              ]}
              onPress={() => setPaymentMethod('CREDIT')}
            >
              <Text style={{ fontSize: 18 }}>📝</Text>
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod === 'CREDIT' && styles.paymentMethodTextActive,
                ]}
              >
                Credit (Udhaar)
              </Text>
            </TouchableOpacity>
          </View>
        </AppCard>

        {/* SUBMIT BUTTON */}
        <AppButton
          title={
            submitting
              ? 'Processing Transaction...'
              : `Complete Sale (₹${total.toLocaleString('en-IN')})`
          }
          onPress={confirmSale}
          disabled={submitting || cart.length === 0}
          loading={submitting}
          size="lg"
          style={styles.checkoutBtn}
        />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  productsScroll: {
    marginBottom: 18,
  },
  productPill: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'space-between',
    minHeight: 100,
  },
  productPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  productPillTop: {},
  productPillName: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.textPrimary,
  },
  productPillSku: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  productPillBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 10,
  },
  productPillPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  productPillStock: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  inCartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inCartBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },

  cartCard: {
    padding: 16,
    marginBottom: 16,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  clearCartText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
  },
  emptyCartBox: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyCartText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptyCartSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cartItemUnit: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  qtyControlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginHorizontal: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  qtyValue: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 8,
    color: colors.textPrimary,
  },
  cartItemTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  billTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  billTotalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },

  sectionCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardHeaderSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  customerChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customerChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  customerChipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  customerChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },

  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  paymentMethodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: colors.border,
    marginHorizontal: 4,
  },
  paymentMethodBtnActiveCash: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
  },
  paymentMethodBtnActiveUpi: {
    backgroundColor: colors.infoBg,
    borderColor: colors.info,
  },
  paymentMethodBtnActiveCredit: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warning,
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
  },
  paymentMethodTextActive: {
    fontWeight: '700',
    color: colors.textPrimary,
  },

  checkoutBtn: {
    marginTop: 8,
    borderRadius: 12,
  },
});
