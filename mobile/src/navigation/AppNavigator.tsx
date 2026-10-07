import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { NewBillScreen } from '../screens/pos/NewBillScreen';
import { SalesScreen } from '../screens/sales/SalesScreen';
import { SaleDetailScreen } from '../screens/sales/SaleDetailScreen';
import { ProductsScreen } from '../screens/products/ProductsScreen';
import { ProductDetailScreen } from '../screens/products/ProductDetailScreen';
import { InventoryScreen } from '../screens/inventory/InventoryScreen';
import { CustomersScreen } from '../screens/customers/CustomersScreen';
import { CustomerDetailScreen } from '../screens/customers/CustomerDetailScreen';
import { SuppliersScreen } from '../screens/suppliers/SuppliersScreen';
import { SupplierDetailScreen } from '../screens/suppliers/SupplierDetailScreen';
import { ExpensesScreen } from '../screens/expenses/ExpensesScreen';
import { ReportsScreen } from '../screens/reports/ReportsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { AddProductScreen } from '../screens/products/AddProductScreen';
import { EditProductScreen } from '../screens/products/EditProductScreen';
import { AddCustomerScreen } from '../screens/customers/AddCustomerScreen';
import { EditCustomerScreen } from '../screens/customers/EditCustomerScreen';
import { AddSupplierScreen } from '../screens/suppliers/AddSupplierScreen';
import { EditSupplierScreen } from '../screens/suppliers/EditSupplierScreen';
import { AddExpenseScreen } from '../screens/expenses/AddExpenseScreen';
import { ROUTES } from '../constants/routes';
import { colors } from '../constants/colors';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: colors.surface,
      },
      headerTintColor: colors.primary,
      headerTitleStyle: {
        fontWeight: '800',
        fontSize: 17,
        color: colors.textPrimary,
      },
      headerShadowVisible: false,
    }}
  >
    <Stack.Screen
      name={ROUTES.HOME}
      component={HomeScreen}
      options={{ title: '🏪 MSME Vyapar ERP' }}
    />
    <Stack.Screen
      name={ROUTES.NEW_BILL}
      component={NewBillScreen}
      options={{ title: '⚡ Point of Sale (POS)' }}
    />
    <Stack.Screen
      name={ROUTES.SALES}
      component={SalesScreen}
      options={{ title: '📋 Sales Ledger' }}
    />
    <Stack.Screen
      name={ROUTES.SALE_DETAIL}
      component={SaleDetailScreen}
      options={{ title: '🧾 Tax Invoice Details' }}
    />
    <Stack.Screen
      name={ROUTES.PRODUCTS}
      component={ProductsScreen}
      options={{ title: '📦 Product Catalog' }}
    />
    <Stack.Screen
      name={ROUTES.PRODUCT_DETAIL}
      component={ProductDetailScreen}
      options={{ title: '🔍 Product Details' }}
    />
    <Stack.Screen
      name={ROUTES.INVENTORY}
      component={InventoryScreen}
      options={{ title: '📊 Inventory & Restock' }}
    />
    <Stack.Screen
      name={ROUTES.CUSTOMERS}
      component={CustomersScreen}
      options={{ title: '👥 Customer Khata Ledger' }}
    />
    <Stack.Screen
      name={ROUTES.CUSTOMER_DETAIL}
      component={CustomerDetailScreen}
      options={{ title: '👤 Customer Account' }}
    />
    <Stack.Screen
      name={ROUTES.SUPPLIERS}
      component={SuppliersScreen}
      options={{ title: '🏭 Accounts Payable & Vendors' }}
    />
    <Stack.Screen
      name={ROUTES.SUPPLIER_DETAIL}
      component={SupplierDetailScreen}
      options={{ title: '🏢 Supplier Account' }}
    />
    <Stack.Screen
      name={ROUTES.EXPENSES}
      component={ExpensesScreen}
      options={{ title: '💸 Expense Tracker' }}
    />
    <Stack.Screen
      name={ROUTES.REPORTS}
      component={ReportsScreen}
      options={{ title: '📈 Financial Reports (P&L)' }}
    />
    <Stack.Screen
      name={ROUTES.SETTINGS}
      component={SettingsScreen}
      options={{ title: '⚙️ Store Settings & Cloud' }}
    />

    {/* Form Screens */}
    <Stack.Screen
      name={ROUTES.ADD_PRODUCT}
      component={AddProductScreen}
      options={{ title: '➕ Add Product' }}
    />
    <Stack.Screen
      name={ROUTES.EDIT_PRODUCT}
      component={EditProductScreen}
      options={{ title: '✏️ Edit Product' }}
    />
    <Stack.Screen
      name={ROUTES.ADD_CUSTOMER}
      component={AddCustomerScreen}
      options={{ title: '➕ Register Customer' }}
    />
    <Stack.Screen
      name={ROUTES.EDIT_CUSTOMER}
      component={EditCustomerScreen}
      options={{ title: '✏️ Edit Customer' }}
    />
    <Stack.Screen
      name={ROUTES.ADD_SUPPLIER}
      component={AddSupplierScreen}
      options={{ title: '➕ Register Supplier' }}
    />
    <Stack.Screen
      name={ROUTES.EDIT_SUPPLIER}
      component={EditSupplierScreen}
      options={{ title: '✏️ Edit Supplier' }}
    />
    <Stack.Screen
      name={ROUTES.ADD_EXPENSE}
      component={AddExpenseScreen}
      options={{ title: '💸 Record Expense' }}
    />
  </Stack.Navigator>
);