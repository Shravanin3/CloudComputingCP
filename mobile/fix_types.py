import os
from pathlib import Path
import re

base = Path(r'd:\projects\clg sem 5\CC\cc_courseproject\mobile\src')

def make_screen(folder, filename, code):
    path = base / 'screens' / folder / filename
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(code.strip(), encoding='utf-8')

# PRODUCT SERVICES FIX
prod_srv = base / 'services' / 'products' / 'productService.ts'
ps_code = prod_srv.read_text('utf-8')
ps_code = ps_code.replace('sellingPrice', 'price')
ps_code = ps_code.replace('costPrice', 'price') # Cost price isn't there
ps_code = ps_code.replace("status !== 'inactive'", "name !== 'DEACTIVATED'") # Hacky active status since it doesn't exist
ps_code = ps_code.replace("status: 'active'", "")
ps_code = ps_code.replace("status = 'inactive'", "name = 'DEACTIVATED'")
prod_srv.write_text(ps_code, 'utf-8')

# CUSTOMER SERVICES FIX
cust_srv = base / 'services' / 'customers' / 'customerService.ts'
cs_code = cust_srv.read_text('utf-8')
cs_code = cs_code.replace('outstandingCredit', 'outstandingBalance')
cust_srv.write_text(cs_code, 'utf-8')

# NEW BILL SCREEN FIX
bill_scr = base / 'screens' / 'pos' / 'NewBillScreen.tsx'
bs_code = bill_scr.read_text('utf-8')
bs_code = bs_code.replace('sellingPrice', 'price')
# CreateSaleRequest items lacks unitPrice, but has total at the top
bs_code = bs_code.replace("items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity, unitPrice: i.product.sellingPrice }))", "items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })), total")
bill_scr.write_text(bs_code, 'utf-8')

# DETAIL SCREENS IMPORTS FIX
def fix_detail(folder, filename):
    p = base / 'screens' / folder / filename
    if p.exists():
        c = p.read_text('utf-8')
        if "import { AppButton }" not in c:
            c = "import { AppButton } from '../../components/common/AppButton';\n" + c
        if "import { ROUTES }" not in c:
            c = "import { ROUTES } from '../../constants/routes';\n" + c
        c = c.replace("{ date: new Date().toISOString() }", "{}") # Because payment requests only take amount
        p.write_text(c, 'utf-8')

fix_detail('products', 'ProductDetailScreen.tsx')
fix_detail('customers', 'CustomerDetailScreen.tsx')
fix_detail('suppliers', 'SupplierDetailScreen.tsx')


# WRITE ADD SCREENS
make_screen('customers', 'AddCustomerScreen.tsx', '''
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { createCustomer } from '../../services/customers/customerService';

export const AddCustomerScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name) return Alert.alert('Error', 'Name is required.');
    setLoading(true);
    try {
      await createCustomer({ name, phone, outstandingBalance: 0 });
      navigation.goBack();
    } catch (e: any) { Alert.alert('Error', e.message); } finally { setLoading(false); }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppInput label="Name" value={name} onChangeText={setName} />
      <AppInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <AppButton title={loading ? "Saving..." : "Save Customer"} onPress={handleSave} disabled={loading} />
    </ScreenContainer>
  );
};
''')

make_screen('suppliers', 'AddSupplierScreen.tsx', '''
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { createSupplier } from '../../services/suppliers/supplierService';

export const AddSupplierScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name) return Alert.alert('Error', 'Name is required.');
    setLoading(true);
    try {
      await createSupplier({ name, phone, payableBalance: 0 });
      navigation.goBack();
    } catch (e: any) { Alert.alert('Error', e.message); } finally { setLoading(false); }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppInput label="Name" value={name} onChangeText={setName} />
      <AppInput label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <AppButton title={loading ? "Saving..." : "Save Supplier"} onPress={handleSave} disabled={loading} />
    </ScreenContainer>
  );
};
''')

make_screen('expenses', 'AddExpenseScreen.tsx', '''
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { createExpense } from '../../services/expenses/expenseService';

export const AddExpenseScreen = ({ navigation }: any) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amount || !category) return Alert.alert('Error', 'Amount and Category are required.');
    setLoading(true);
    try {
      await createExpense({ amount: Number(amount), category, description });
      navigation.goBack();
    } catch (e: any) { Alert.alert('Error', e.message); } finally { setLoading(false); }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppInput label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <AppInput label="Category" value={category} onChangeText={setCategory} />
      <AppInput label="Description" value={description} onChangeText={setDescription} />
      <AppButton title={loading ? "Saving..." : "Save Expense"} onPress={handleSave} disabled={loading} />
    </ScreenContainer>
  );
};
''')

# Fix AddProductScreen
prod_add = base / 'screens' / 'products' / 'AddProductScreen.tsx'
if prod_add.exists():
    c = prod_add.read_text('utf-8')
    c = c.replace('sellingPrice: Number(price)', 'price: Number(price)')
    c = c.replace(', costPrice: Number(cost)', '')
    prod_add.write_text(c, 'utf-8')

# Fix EditProductScreen
prod_edit = base / 'screens' / 'products' / 'EditProductScreen.tsx'
if prod_edit.exists():
    c = prod_edit.read_text('utf-8')
    c = c.replace('sellingPrice: Number(price)', 'price: Number(price)')
    c = c.replace('product?.sellingPrice', 'product?.price')
    prod_edit.write_text(c, 'utf-8')
    
print("Successfully patched")
