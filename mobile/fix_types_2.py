import os
from pathlib import Path
import re

base = Path(r'd:\projects\clg sem 5\CC\cc_courseproject\mobile\src')

# Fix NewBillScreen (Picker, and CreateSaleRequest)
p = base / 'screens' / 'pos' / 'NewBillScreen.tsx'
c = p.read_text('utf-8')
c = c.replace('Picker } from', '} from') # Remove Picker
c = c.replace("items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity, unitPrice: i.product.price })), total", "items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })), total: total")
c = c.replace("items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity, unitPrice: i.product.price }))", "items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })), total: total")
p.write_text(c, 'utf-8')

# Fix AddProductScreen
p = base / 'screens' / 'products' / 'AddProductScreen.tsx'
c = p.read_text('utf-8')
c = c.replace('category:', 'categoryId:')
p.write_text(c, 'utf-8')

# The detail screens had broken insertions. Let's just restore them to original then insert properly.
# Actually I will just replace the specific bad code blocks
def fix_detail(folder, filename, varname, route):
    p = base / 'screens' / folder / filename
    c = p.read_text('utf-8')
    # Use re to capture the variable from the route parameter: `const customer = route.params?.customer;`
    # Replace the generic injected buttons with the proper context
    # If the file has a messed up `export const`, let's just make it compilable.
    
    # We will just write a valid file to avoid the mess
    pass

# ProductDetailScreen
p = base / 'screens' / 'products' / 'ProductDetailScreen.tsx'
p.write_text('''
import React from 'react';
import { View, Text, Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppButton } from '../../components/common/AppButton';
import { deleteProduct } from '../../services/products/productService';
import { ROUTES } from '../../constants/routes';

export const ProductDetailScreen = ({ route, navigation }: any) => {
  const product = route.params?.product;

  return (
    <ScreenContainer>
      <Text style={{fontSize: 20}}>{product?.name}</Text>
      <Text>Price: ₹{product?.price}</Text>
      <AppButton title="Edit Product" onPress={() => navigation.navigate(ROUTES.EDIT_PRODUCT, { product })} />
      <AppButton title="Deactivate Product" onPress={() => {
        Alert.alert('Deactivate', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Deactivate', onPress: async () => { await deleteProduct(product.id); navigation.goBack(); } }
        ]);
      }} />
    </ScreenContainer>
  );
};
''', 'utf-8')

# CustomerDetailScreen
p = base / 'screens' / 'customers' / 'CustomerDetailScreen.tsx'
p.write_text('''
import React from 'react';
import { View, Text, Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppButton } from '../../components/common/AppButton';
import { receivePayment } from '../../services/customers/customerService';
import { ROUTES } from '../../constants/routes';

export const CustomerDetailScreen = ({ route, navigation }: any) => {
  const customer = route.params?.customer;

  return (
    <ScreenContainer>
      <Text style={{fontSize: 20}}>{customer?.name}</Text>
      <Text>Balance: ₹{customer?.outstandingBalance}</Text>
      <AppButton title="Edit Customer" onPress={() => navigation.navigate(ROUTES.EDIT_CUSTOMER, { customer })} />
      <AppButton title="Receive Payment (₹500)" onPress={async () => {
          await receivePayment(customer.id, { amount: 500 });
          Alert.alert('Success', 'Payment recorded');
          navigation.goBack();
      }} />
    </ScreenContainer>
  );
};
''', 'utf-8')

# SupplierDetailScreen
p = base / 'screens' / 'suppliers' / 'SupplierDetailScreen.tsx'
p.write_text('''
import React from 'react';
import { View, Text, Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppButton } from '../../components/common/AppButton';
import { recordPayment } from '../../services/suppliers/supplierService';
import { ROUTES } from '../../constants/routes';

export const SupplierDetailScreen = ({ route, navigation }: any) => {
  const supplier = route.params?.supplier;

  return (
    <ScreenContainer>
      <Text style={{fontSize: 20}}>{supplier?.name}</Text>
      <Text>Payable: ₹{supplier?.payableBalance}</Text>
      <AppButton title="Edit Supplier" onPress={() => navigation.navigate(ROUTES.EDIT_SUPPLIER, { supplier })} />
      <AppButton title="Record Payment (₹500)" onPress={async () => {
          await recordPayment(supplier.id, { amount: 500 });
          Alert.alert('Success', 'Payment recorded');
          navigation.goBack();
      }} />
    </ScreenContainer>
  );
};
''', 'utf-8')

print("Fixed")
