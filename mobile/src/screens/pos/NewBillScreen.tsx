import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { LoadingState } from '../../components/common/LoadingState';
import { getProducts } from '../../services/products/productService';
import { getCustomers, createCustomer } from '../../services/customers/customerService';
import { createSale } from '../../services/sales/salesService';
import { Product } from '../../types/product';
import { Customer } from '../../types/customer';
import { ROUTES } from '../../constants/routes';
import { colors } from '../../constants/colors';
import { useAuth } from '../../navigation/AuthContext';

export const NewBillScreen = () => {
  const navigation = useNavigation<any>();
  const { tenant } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CREDIT'>('CASH');
  const [submitting, setSubmitting] = useState(false);

  // Cash Mode State
  const [cashReceived, setCashReceived] = useState<string>('');

  // UPI Mode State
  const defaultUpi = useMemo(() => {
    const raw = tenant?.shopName ? tenant.shopName.toLowerCase().replace(/[^a-z0-9]/g, '') : 'kirana';
    return `${raw || 'store'}@upi`;
  }, [tenant]);
  const [shopUpiId, setShopUpiId] = useState<string>(defaultUpi);
  const [isEditingShopUpi, setIsEditingShopUpi] = useState(false);
  const [customerUpiId, setCustomerUpiId] = useState<string>('');
  const [upiRefNumber, setUpiRefNumber] = useState<string>('');

  // Credit / Udhaar Mode State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustInitialCredit, setNewCustInitialCredit] = useState('');
  const [savingCustomer, setSavingCustomer] = useState(false);

  const loadData = useCallback(() => {
    Promise.all([getProducts(), getCustomers()])
      .then(([prods, custs]) => {
        setProducts(prods);
        setCustomers(custs);
      })
      .catch((e) => console.log('Error loading POS:', e))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

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

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + (Number(item.product.sellingPrice) || 0) * item.quantity,
        0
      ),
    [cart]
  );

  // Cash calculations
  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const changeToReturn = cashReceivedNum >= total ? cashReceivedNum - total : 0;
  const isShort = cashReceivedNum > 0 && cashReceivedNum < total;
  const shortAmount = isShort ? total - cashReceivedNum : 0;

  // Selected customer object
  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId),
    [customers, selectedCustomerId]
  );

  // Handle Inline Add Customer
  const handleAddNewCustomer = async () => {
    if (!newCustName.trim()) {
      Alert.alert('Validation Error', 'Please enter customer name');
      return;
    }
    if (!newCustPhone.trim()) {
      Alert.alert('Validation Error', 'Please enter customer phone number');
      return;
    }

    setSavingCustomer(true);
    try {
      const created = await createCustomer({
        name: newCustName.trim(),
        phone: newCustPhone.trim(),
        creditBalance: parseFloat(newCustInitialCredit) || 0,
      });

      // Update local state and auto-select
      setCustomers((prev) => [created, ...prev]);
      setSelectedCustomerId(created.id);
      setShowAddCustomer(false);
      setNewCustName('');
      setNewCustPhone('');
      setNewCustInitialCredit('');

      Alert.alert('Customer Added', `${created.name} was successfully registered and selected for this bill.`);
    } catch (e: any) {
      Alert.alert('Failed to Add Customer', e.message || 'Could not save customer');
    } finally {
      setSavingCustomer(false);
    }
  };

  // Confirm Sale
  const confirmSale = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add at least one product to the bill.');
      return;
    }

    if (paymentMethod === 'CREDIT' && !selectedCustomerId) {
      Alert.alert('Customer Required', 'Credit (Udhaar) sales require selecting or adding a customer account.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        customerId: selectedCustomerId || undefined,
        paymentMethod,
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      };

      if (paymentMethod === 'CASH') {
        payload.cashTendered = cashReceivedNum > 0 ? cashReceivedNum : total;
        payload.changeReturned = changeToReturn;
      } else if (paymentMethod === 'UPI') {
        payload.upiId = customerUpiId.trim() || undefined;
        payload.upiRef = upiRefNumber.trim() || undefined;
        payload.notes = `Paid to shop UPI: ${shopUpiId}`;
      }

      await createSale(payload);

      let successDetail = '';
      if (paymentMethod === 'CASH') {
        successDetail = cashReceivedNum > total
          ? `\nCash Received: ₹${cashReceivedNum.toLocaleString('en-IN')}\nChange Returned: ₹${changeToReturn.toLocaleString('en-IN')}`
          : '\nExact cash received.';
      } else if (paymentMethod === 'UPI') {
        successDetail = upiRefNumber
          ? `\nUPI UTR Ref: ${upiRefNumber}`
          : '\nUPI payment verified.';
      } else if (paymentMethod === 'CREDIT' && selectedCustomer) {
        const prevBal = Number(selectedCustomer.creditBalance || 0);
        const newBal = prevBal + total;
        successDetail = `\nCustomer: ${selectedCustomer.name}\nPrevious Udhaar: ₹${prevBal.toLocaleString('en-IN')}\nNew Total Udhaar: ₹${newBal.toLocaleString('en-IN')}`;
      }

      Alert.alert(
        '🎉 Sale Completed Successfully!',
        `Recorded ₹${total.toLocaleString('en-IN')} via ${paymentMethod}.${successDetail}\n\nInventory updated in database.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setCart([]);
              setSelectedCustomerId('');
              setCashReceived('');
              setCustomerUpiId('');
              setUpiRefNumber('');
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

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(customerSearch))
  );

  // Dynamic UPI string and QR link
  const shopName = tenant?.shopName || 'Retail Kirana Store';
  const upiIntentString = `upi://pay?pa=${encodeURIComponent(shopUpiId)}&pn=${encodeURIComponent(shopName)}&am=${total}&cu=INR&tn=POS%20Bill`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=2&data=${encodeURIComponent(upiIntentString)}`;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Point of Sale (POS)</Text>
          <Text style={styles.headerSubtitle}>Tap products to build bill & collect payment</Text>
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
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: colors.textMuted, fontSize: 16, paddingHorizontal: 4 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* PRODUCT CATALOG HORIZONTAL SCROLLER */}
        <Text style={styles.sectionTitle}>Product Catalog ({filteredProducts.length})</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.productsScroll}
        >
          {filteredProducts.map((p) => {
            const inCart = cart.find((i) => i.product.id === p.id);
            const stock = p.inventory?.stockQuantity ?? p.stock ?? 0;
            const isOut = stock <= 0;

            return (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.productPill,
                  inCart && styles.productPillActive,
                  isOut && { opacity: 0.5 },
                ]}
                onPress={() => !isOut && addToCart(p)}
                disabled={isOut}
                activeOpacity={0.7}
              >
                <View style={styles.productPillTop}>
                  <Text style={styles.productPillName} numberOfLines={2}>
                    {p.name}
                  </Text>
                  {p.sku ? <Text style={styles.productPillSku}>#{p.sku}</Text> : null}
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
            <Text style={styles.cartTitle}>Current Bill ({cart.length} items)</Text>
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
              <Text style={styles.emptyCartSub}>Tap items from the catalog above to add</Text>
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

                <View style={{ width: 75, alignItems: 'flex-end' }}>
                  <Text style={styles.cartItemTotal}>
                    ₹{(Number(item.product.sellingPrice) * item.quantity).toLocaleString('en-IN')}
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

        {/* PAYMENT METHOD SELECTION TABS */}
        <AppCard style={styles.sectionCard}>
          <Text style={styles.cardHeaderTitle}>Payment Method</Text>
          <Text style={styles.cardHeaderSubtitle}>Select how the customer is paying</Text>

          <View style={styles.paymentMethodRow}>
            {/* CASH */}
            <TouchableOpacity
              style={[
                styles.paymentMethodBtn,
                paymentMethod === 'CASH' && styles.paymentMethodBtnActiveCash,
              ]}
              onPress={() => setPaymentMethod('CASH')}
            >
              <Text style={{ fontSize: 20 }}>💵</Text>
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod === 'CASH' && styles.paymentMethodTextActive,
                ]}
              >
                Cash
              </Text>
            </TouchableOpacity>

            {/* UPI / QR */}
            <TouchableOpacity
              style={[
                styles.paymentMethodBtn,
                paymentMethod === 'UPI' && styles.paymentMethodBtnActiveUpi,
              ]}
              onPress={() => setPaymentMethod('UPI')}
            >
              <Text style={{ fontSize: 20 }}>📱</Text>
              <Text
                style={[
                  styles.paymentMethodText,
                  paymentMethod === 'UPI' && styles.paymentMethodTextActive,
                ]}
              >
                UPI / QR
              </Text>
            </TouchableOpacity>

            {/* CREDIT (UDHAAR) */}
            <TouchableOpacity
              style={[
                styles.paymentMethodBtn,
                paymentMethod === 'CREDIT' && styles.paymentMethodBtnActiveCredit,
              ]}
              onPress={() => setPaymentMethod('CREDIT')}
            >
              <Text style={{ fontSize: 20 }}>🤝</Text>
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

        {/* ------------------------------------------------------------- */}
        {/* PAYMENT MODE SPECIFIC SECTIONS */}
        {/* ------------------------------------------------------------- */}

        {/* 1. CASH PAYMENT MODE DETAILS */}
        {paymentMethod === 'CASH' && (
          <AppCard style={[styles.sectionCard, { borderColor: colors.successBorder, borderWidth: 1.5 }]}>
            <View style={styles.modeHeader}>
              <View style={[styles.modeIconCircle, { backgroundColor: colors.successBg }]}>
                <Text style={{ fontSize: 18 }}>💵</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.modeTitle}>Cash Settlement</Text>
                <Text style={styles.modeSub}>Track customer tender & compute exact change</Text>
              </View>
            </View>

            {/* Cash Input */}
            <Text style={styles.inputFieldLabel}>Cash Received from Customer (₹)</Text>
            <View style={styles.cashInputBox}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              <TextInput
                style={styles.cashTextInput}
                placeholder={total > 0 ? total.toString() : '0'}
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={cashReceived}
                onChangeText={setCashReceived}
              />
              {cashReceived.length > 0 && (
                <TouchableOpacity onPress={() => setCashReceived('')} style={styles.clearTenderBtn}>
                  <Text style={{ color: colors.textMuted, fontSize: 14 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Denomination Chips */}
            <View style={styles.chipsRow}>
              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => setCashReceived(total.toString())}
              >
                <Text style={styles.quickChipText}>Exact ₹{total}</Text>
              </TouchableOpacity>
              {[100, 200, 500, 2000].map((denom) => (
                <TouchableOpacity
                  key={denom}
                  style={styles.quickChip}
                  onPress={() => setCashReceived(denom.toString())}
                >
                  <Text style={styles.quickChipText}>₹{denom}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.quickChip, { backgroundColor: '#EEF2FF' }]}
                onPress={() => setCashReceived((cashReceivedNum + 50).toString())}
              >
                <Text style={[styles.quickChipText, { color: colors.primary }]}>+₹50</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickChip, { backgroundColor: '#EEF2FF' }]}
                onPress={() => setCashReceived((cashReceivedNum + 100).toString())}
              >
                <Text style={[styles.quickChipText, { color: colors.primary }]}>+₹100</Text>
              </TouchableOpacity>
            </View>

            {/* Real-time Change / Short Banner */}
            {cashReceivedNum >= total && total > 0 ? (
              <View style={styles.changeBannerSuccess}>
                <View style={styles.changeBannerHeader}>
                  <Text style={styles.changeBannerIcon}>💸</Text>
                  <Text style={styles.changeBannerLabel}>Return to Customer:</Text>
                  <Text style={styles.changeBannerValue}>
                    ₹{changeToReturn.toLocaleString('en-IN')}
                  </Text>
                </View>
                <Text style={styles.changeBannerSub}>
                  Received ₹{cashReceivedNum.toLocaleString('en-IN')} - Bill ₹{total.toLocaleString('en-IN')}
                </Text>
              </View>
            ) : isShort ? (
              <View style={styles.changeBannerWarning}>
                <View style={styles.changeBannerHeader}>
                  <Text style={styles.changeBannerIcon}>⚠️</Text>
                  <Text style={[styles.changeBannerLabel, { color: '#B45309' }]}>Short Amount:</Text>
                  <Text style={[styles.changeBannerValue, { color: colors.danger }]}>
                    ₹{shortAmount.toLocaleString('en-IN')}
                  </Text>
                </View>
                <Text style={[styles.changeBannerSub, { color: '#B45309' }]}>
                  Customer still needs to pay ₹{shortAmount.toLocaleString('en-IN')}
                </Text>
              </View>
            ) : (
              <View style={styles.changeBannerNeutral}>
                <Text style={styles.changeBannerNeutralText}>
                  💡 Enter cash handed over or tap Exact to calculate return change
                </Text>
              </View>
            )}
          </AppCard>
        )}

        {/* 2. UPI / QR PAYMENT MODE DETAILS */}
        {paymentMethod === 'UPI' && (
          <AppCard style={[styles.sectionCard, { borderColor: colors.infoBorder, borderWidth: 1.5 }]}>
            <View style={styles.modeHeader}>
              <View style={[styles.modeIconCircle, { backgroundColor: colors.infoBg }]}>
                <Text style={{ fontSize: 18 }}>📱</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.modeTitle}>UPI Payment & Shop QR</Text>
                <Text style={styles.modeSub}>Customer scans to pay exact bill amount</Text>
              </View>
            </View>

            {/* Shop QR Code Container */}
            <View style={styles.qrCardContainer}>
              <Text style={styles.qrStoreName}>{shopName}</Text>
              <Text style={styles.qrAmountText}>₹{total.toLocaleString('en-IN')}</Text>

              {total > 0 ? (
                <View style={styles.qrImageFrame}>
                  <Image
                    source={{ uri: qrCodeUrl }}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.qrScanText}>Scan with any UPI App</Text>
                </View>
              ) : (
                <View style={[styles.qrImageFrame, { height: 180, justifyContent: 'center' }]}>
                  <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>
                    Add items to cart to generate payment QR code
                  </Text>
                </View>
              )}

              {/* Shop VPA Display & Inline Editor */}
              <View style={styles.vpaRow}>
                <Text style={styles.vpaLabel}>Shop VPA:</Text>
                {isEditingShopUpi ? (
                  <View style={{ flexDirection: 'row', flex: 1, marginLeft: 8 }}>
                    <TextInput
                      style={styles.vpaInput}
                      value={shopUpiId}
                      onChangeText={setShopUpiId}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      onPress={() => setIsEditingShopUpi(false)}
                      style={styles.vpaDoneBtn}
                    >
                      <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12 }}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 6 }}>
                    <Text style={styles.vpaText}>{shopUpiId}</Text>
                    <TouchableOpacity onPress={() => setIsEditingShopUpi(true)} style={{ marginLeft: 6 }}>
                      <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '700' }}>✏️ Edit</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Text style={styles.upiBadges}>Google Pay • PhonePe • Paytm • BHIM • Cred</Text>
            </View>

            {/* Transaction Verification Inputs to Store in DB */}
            <View style={{ marginTop: 14 }}>
              <Text style={styles.inputFieldLabel}>Customer UPI ID / Phone (Optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. customer@okhdfcbank or 9876543210"
                placeholderTextColor={colors.textMuted}
                value={customerUpiId}
                onChangeText={setCustomerUpiId}
                autoCapitalize="none"
              />

              <Text style={styles.inputFieldLabel}>UPI Reference No. / UTR (Optional)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. 428938192031 (12-digit UTR)"
                placeholderTextColor={colors.textMuted}
                value={upiRefNumber}
                onChangeText={setUpiRefNumber}
                keyboardType="numeric"
              />
            </View>
          </AppCard>
        )}

        {/* 3. CREDIT (UDHAAR) PAYMENT MODE DETAILS */}
        {paymentMethod === 'CREDIT' && (
          <AppCard style={[styles.sectionCard, { borderColor: colors.warningBorder, borderWidth: 1.5 }]}>
            <View style={styles.modeHeader}>
              <View style={[styles.modeIconCircle, { backgroundColor: colors.warningBg }]}>
                <Text style={{ fontSize: 18 }}>🤝</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.modeTitle}>Credit Ledger (Udhaar)</Text>
                <Text style={styles.modeSub}>Select customer to record pending book balance</Text>
              </View>
              <TouchableOpacity
                style={styles.addCustHeaderBtn}
                onPress={() => setShowAddCustomer(!showAddCustomer)}
              >
                <Text style={styles.addCustHeaderBtnText}>
                  {showAddCustomer ? '✕ Close' : '+ New Customer'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Inline Add Customer Form */}
            {showAddCustomer && (
              <View style={styles.addCustomerBox}>
                <Text style={styles.addCustTitle}>Register New Customer</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Full Name (e.g. Suresh Patel) *"
                  placeholderTextColor={colors.textMuted}
                  value={newCustName}
                  onChangeText={setNewCustName}
                />
                <TextInput
                  style={styles.formInput}
                  placeholder="Mobile Number (e.g. 9876543210) *"
                  placeholderTextColor={colors.textMuted}
                  value={newCustPhone}
                  onChangeText={setNewCustPhone}
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={styles.formInput}
                  placeholder="Initial Previous Udhaar (₹, default 0)"
                  placeholderTextColor={colors.textMuted}
                  value={newCustInitialCredit}
                  onChangeText={setNewCustInitialCredit}
                  keyboardType="numeric"
                />
                <AppButton
                  title={savingCustomer ? 'Saving Customer...' : 'Save & Select Customer'}
                  onPress={handleAddNewCustomer}
                  loading={savingCustomer}
                  size="sm"
                  style={{ marginTop: 4 }}
                />
              </View>
            )}

            {/* Selected Customer Stats Card */}
            {selectedCustomer ? (
              <View style={styles.selectedCustomerCard}>
                <View style={styles.selectedCustHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selectedCustName}>👤 {selectedCustomer.name}</Text>
                    {selectedCustomer.phone ? (
                      <Text style={styles.selectedCustPhone}>📞 {selectedCustomer.phone}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedCustomerId('')}
                    style={styles.changeCustBtn}
                  >
                    <Text style={styles.changeCustBtnText}>Change</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.balanceComparisonRow}>
                  <View style={styles.balanceCompCol}>
                    <Text style={styles.compLabel}>Previous Udhaar</Text>
                    <Text style={styles.compValuePrev}>
                      ₹{(Number(selectedCustomer.creditBalance) || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <Text style={styles.plusSign}>+</Text>

                  <View style={styles.balanceCompCol}>
                    <Text style={styles.compLabel}>This Bill</Text>
                    <Text style={styles.compValueThis}>
                      ₹{total.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <Text style={styles.equalsSign}>=</Text>

                  <View style={styles.balanceCompCol}>
                    <Text style={styles.compLabel}>New Total Balance</Text>
                    <Text style={styles.compValueNew}>
                      ₹{((Number(selectedCustomer.creditBalance) || 0) + total).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={{ marginTop: 10 }}>
                {/* Search Customer Input */}
                <View style={styles.custSearchBox}>
                  <Text style={{ marginRight: 6 }}>🔍</Text>
                  <TextInput
                    style={styles.custSearchInput}
                    placeholder="Search existing customer by name or phone..."
                    placeholderTextColor={colors.textMuted}
                    value={customerSearch}
                    onChangeText={setCustomerSearch}
                  />
                  {customerSearch.length > 0 && (
                    <TouchableOpacity onPress={() => setCustomerSearch('')}>
                      <Text style={{ color: colors.textMuted }}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Customer List Scroll */}
                <Text style={styles.custSelectHeader}>
                  Tap customer to link ({filteredCustomers.length}):
                </Text>
                <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled>
                  {filteredCustomers.length === 0 ? (
                    <View style={styles.emptyCustBox}>
                      <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
                        No customers found matching "{customerSearch}".
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowAddCustomer(true)}
                        style={{ marginTop: 6 }}
                      >
                        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>
                          + Add "{customerSearch}" as new customer
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    filteredCustomers.map((cust) => {
                      const bal = Number(cust.creditBalance) || 0;
                      return (
                        <TouchableOpacity
                          key={cust.id}
                          style={styles.custItemRow}
                          onPress={() => setSelectedCustomerId(cust.id)}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={styles.custRowName}>{cust.name}</Text>
                            <Text style={styles.custRowPhone}>📞 {cust.phone || 'No phone'}</Text>
                          </View>
                          <View style={styles.custRowBalBox}>
                            <Text style={styles.custRowBalLabel}>Previous Udhaar</Text>
                            <Text
                              style={[
                                styles.custRowBalAmount,
                                bal > 0 ? { color: colors.danger } : { color: colors.success },
                              ]}
                            >
                              ₹{bal.toLocaleString('en-IN')}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            )}
          </AppCard>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUBMIT / CHECKOUT BUTTON */}
        {/* ------------------------------------------------------------- */}
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

  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  paymentMethodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: colors.border,
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
    fontWeight: '800',
    color: colors.textPrimary,
  },

  // MODE HEADERS
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modeSub: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // CASH SPECIFIC STYLES
  inputFieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 8,
    marginBottom: 6,
  },
  cashInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rupeeSymbol: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    marginRight: 6,
  },
  cashTextInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  clearTenderBtn: {
    padding: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    marginBottom: 12,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },

  changeBannerSuccess: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  changeBannerWarning: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warning,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },
  changeBannerNeutral: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  changeBannerNeutralText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  changeBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeBannerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  changeBannerLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
    flex: 1,
  },
  changeBannerValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.success,
  },
  changeBannerSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 4,
    fontWeight: '600',
  },

  // UPI SPECIFIC STYLES
  qrCardContainer: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  qrStoreName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  qrAmountText: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 2,
    marginBottom: 10,
  },
  qrImageFrame: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  qrScanText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 6,
  },
  vpaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  vpaLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  vpaText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  vpaInput: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flex: 1,
  },
  vpaDoneBtn: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 6,
  },
  upiBadges: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 10,
  },

  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 8,
  },

  // CREDIT / UDHAAR SPECIFIC STYLES
  addCustHeaderBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addCustHeaderBtnText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  addCustomerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    marginBottom: 12,
  },
  addCustTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },

  selectedCustomerCard: {
    backgroundColor: colors.warningBg,
    borderWidth: 1.5,
    borderColor: colors.warning,
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
  },
  selectedCustHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.warningBorder,
    paddingBottom: 8,
    marginBottom: 10,
  },
  selectedCustName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  selectedCustPhone: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  changeCustBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeCustBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.warning,
  },
  balanceComparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceCompCol: {
    alignItems: 'center',
    flex: 1,
  },
  compLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  compValuePrev: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  compValueThis: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  compValueNew: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.danger,
  },
  plusSign: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMuted,
    paddingHorizontal: 2,
  },
  equalsSign: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMuted,
    paddingHorizontal: 2,
  },

  custSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 8,
  },
  custSearchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  custSelectHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  emptyCustBox: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  custItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 6,
  },
  custRowName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  custRowPhone: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  custRowBalBox: {
    alignItems: 'flex-end',
  },
  custRowBalLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  custRowBalAmount: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },

  checkoutBtn: {
    marginTop: 4,
    borderRadius: 12,
  },
});
