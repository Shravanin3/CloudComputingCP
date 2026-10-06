import os
from pathlib import Path
import re

base = Path(r'd:\projects\clg sem 5\CC\cc_courseproject\mobile\src')

# Function to create screens
def make_screen(folder, filename, code):
    path = base / 'screens' / folder / filename
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(code.strip(), encoding='utf-8')

make_screen('products', 'EditProductScreen.tsx', '''
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { updateProduct } from '../../services/products/productService';
import { useNavigation, useRoute } from '@react-navigation/native';

export const EditProductScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const product = route.params?.product;

  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.sellingPrice?.toString() || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name || !price) { Alert.alert('Error', 'Name and Selling Price are required.'); return; }
    setLoading(true);
    try {
      await updateProduct(product.id, { name, sellingPrice: Number(price) });
      Alert.alert('Success', 'Product updated successfully.');
      navigation.goBack();
    } catch (e: any) { Alert.alert('Error', e.message); } finally { setLoading(false); }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppInput label="Name" value={name} onChangeText={setName} />
      <AppInput label="Selling Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <AppButton title={loading ? "Saving..." : "Update Product"} onPress={handleSave} disabled={loading} />
    </ScreenContainer>
  );
};
''')

make_screen('customers', 'EditCustomerScreen.tsx', '''
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { updateCustomer } from '../../services/customers/customerService';
import { useNavigation, useRoute } from '@react-navigation/native';

export const EditCustomerScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const customer = route.params?.customer;

  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name) return Alert.alert('Error', 'Name is required.');
    setLoading(true);
    try {
      await updateCustomer(customer.id, { name, phone });
      navigation.goBack();
    } catch (e: any) { Alert.alert('Error', e.message); } finally { setLoading(false); }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppInput label="Name" value={name} onChangeText={setName} />
      <AppInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <AppButton title={loading ? "Saving..." : "Update Customer"} onPress={handleSave} disabled={loading} />
    </ScreenContainer>
  );
};
''')

make_screen('suppliers', 'EditSupplierScreen.tsx', '''
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { updateSupplier } from '../../services/suppliers/supplierService';
import { useNavigation, useRoute } from '@react-navigation/native';

export const EditSupplierScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const supplier = route.params?.supplier;

  const [name, setName] = useState(supplier?.name || '');
  const [phone, setPhone] = useState(supplier?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name) return Alert.alert('Error', 'Name is required.');
    setLoading(true);
    try {
      await updateSupplier(supplier.id, { name, phone });
      navigation.goBack();
    } catch (e: any) { Alert.alert('Error', e.message); } finally { setLoading(false); }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppInput label="Name" value={name} onChangeText={setName} />
      <AppInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <AppButton title={loading ? "Saving..." : "Update Supplier"} onPress={handleSave} disabled={loading} />
    </ScreenContainer>
  );
};
''')

# Update Product Detail with Deactivate button
product_detail = base / 'screens' / 'products' / 'ProductDetailScreen.tsx'
if product_detail.exists():
    code = product_detail.read_text('utf-8')
    if 'deleteProduct' not in code:
        code = code.replace('export const ProductDetailScreen', 'import { deleteProduct } from \'../../services/products/productService\';\nimport { Alert } from \'react-native\';\nexport const ProductDetailScreen')
        code = code.replace('</ScreenContainer>', '''
      <AppButton title="Edit Product" onPress={() => navigation.navigate(ROUTES.EDIT_PRODUCT, { product })} />
      <AppButton title="Deactivate Product" onPress={() => {
        Alert.alert('Deactivate', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Deactivate', onPress: async () => { await deleteProduct(product.id); navigation.goBack(); } }
        ]);
      }} />
    </ScreenContainer>''')
        product_detail.write_text(code, 'utf-8')

# Update Customer Detail with Payment
customer_detail = base / 'screens' / 'customers' / 'CustomerDetailScreen.tsx'
if customer_detail.exists():
    code = customer_detail.read_text('utf-8')
    if 'receivePayment' not in code:
        code = code.replace('export const CustomerDetailScreen', '''
import { receivePayment } from '../../services/customers/customerService';
import { Alert } from 'react-native';
export const CustomerDetailScreen''')
        code = code.replace('</ScreenContainer>', '''
      <AppButton title="Edit Customer" onPress={() => navigation.navigate(ROUTES.EDIT_CUSTOMER, { customer })} />
      <AppButton title="Receive Payment (₹500)" onPress={async () => {
          await receivePayment(customer.id, { amount: 500, date: new Date().toISOString() });
          Alert.alert('Success', 'Payment recorded');
          navigation.goBack();
      }} />
    </ScreenContainer>''')
        customer_detail.write_text(code, 'utf-8')

# Update Supplier Detail with Payment
supplier_detail = base / 'screens' / 'suppliers' / 'SupplierDetailScreen.tsx'
if supplier_detail.exists():
    code = supplier_detail.read_text('utf-8')
    if 'recordPayment' not in code:
        code = code.replace('export const SupplierDetailScreen', '''
import { recordPayment } from '../../services/suppliers/supplierService';
import { Alert } from 'react-native';
export const SupplierDetailScreen''')
        code = code.replace('</ScreenContainer>', '''
      <AppButton title="Edit Supplier" onPress={() => navigation.navigate(ROUTES.EDIT_SUPPLIER, { supplier })} />
      <AppButton title="Record Payment (₹500)" onPress={async () => {
          await recordPayment(supplier.id, { amount: 500, date: new Date().toISOString() });
          Alert.alert('Success', 'Payment recorded');
          navigation.goBack();
      }} />
    </ScreenContainer>''')
        supplier_detail.write_text(code, 'utf-8')

# Update Inventory with Restock
inventory = base / 'screens' / 'inventory' / 'InventoryScreen.tsx'
if inventory.exists():
    code = inventory.read_text('utf-8')
    if 'restockInventory' not in code:
        code = code.replace('export const InventoryScreen', '''
import { restockInventory } from '../../services/inventory/inventoryService';
import { Alert } from 'react-native';
export const InventoryScreen''')
        code = code.replace('<Text>Stock:', '''
        {item.stock < 10 && <Text style={{color: 'red'}}>LOW STOCK</Text>}
        <Text>Stock:''')
        code = code.replace('</AppCard>', '''
            <AppButton title="Restock +10" onPress={async () => {
                await restockInventory({ productId: item.productId, quantity: 10 });
                Alert.alert('Success', 'Restocked 10 units');
                // Assume refresh logic
            }} />
        </AppCard>''')
        inventory.write_text(code, 'utf-8')

print('Success')
