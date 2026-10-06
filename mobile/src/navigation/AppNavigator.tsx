import React from 'react'; import { createNativeStackNavigator } from '@react-navigation/native-stack'; import { HomeScreen } from '../screens/home/HomeScreen'; import { NewBillScreen } from '../screens/pos/NewBillScreen'; import { SalesScreen } from '../screens/sales/SalesScreen'; import { SaleDetailScreen } from '../screens/sales/SaleDetailScreen'; import { ProductsScreen } from '../screens/products/ProductsScreen'; import { ProductDetailScreen } from '../screens/products/ProductDetailScreen'; import { InventoryScreen } from '../screens/inventory/InventoryScreen'; import { CustomersScreen } from '../screens/customers/CustomersScreen'; import { CustomerDetailScreen } from '../screens/customers/CustomerDetailScreen'; import { SuppliersScreen } from '../screens/suppliers/SuppliersScreen'; import { SupplierDetailScreen } from '../screens/suppliers/SupplierDetailScreen'; import { ExpensesScreen } from '../screens/expenses/ExpensesScreen'; import { ReportsScreen } from '../screens/reports/ReportsScreen'; import { SettingsScreen } from '../screens/settings/SettingsScreen'; import { ROUTES } from '../constants/routes';

import { AddProductScreen } from '../screens/products/AddProductScreen';
import { EditProductScreen } from '../screens/products/EditProductScreen';
import { AddCustomerScreen } from '../screens/customers/AddCustomerScreen';
import { EditCustomerScreen } from '../screens/customers/EditCustomerScreen';
import { AddSupplierScreen } from '../screens/suppliers/AddSupplierScreen';
import { EditSupplierScreen } from '../screens/suppliers/EditSupplierScreen';
import { AddExpenseScreen } from '../screens/expenses/AddExpenseScreen';

const Stack = createNativeStackNavigator();
export const AppNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
    <Stack.Screen name={ROUTES.NEW_BILL} component={NewBillScreen} />
    <Stack.Screen name={ROUTES.SALES} component={SalesScreen} />
    <Stack.Screen name={ROUTES.SALE_DETAIL} component={SaleDetailScreen} />
    <Stack.Screen name={ROUTES.PRODUCTS} component={ProductsScreen} />
    <Stack.Screen name={ROUTES.PRODUCT_DETAIL} component={ProductDetailScreen} />
    <Stack.Screen name={ROUTES.INVENTORY} component={InventoryScreen} />
    <Stack.Screen name={ROUTES.CUSTOMERS} component={CustomersScreen} />
    <Stack.Screen name={ROUTES.CUSTOMER_DETAIL} component={CustomerDetailScreen} />
    <Stack.Screen name={ROUTES.SUPPLIERS} component={SuppliersScreen} />
    <Stack.Screen name={ROUTES.SUPPLIER_DETAIL} component={SupplierDetailScreen} />
    <Stack.Screen name={ROUTES.EXPENSES} component={ExpensesScreen} />
    <Stack.Screen name={ROUTES.REPORTS} component={ReportsScreen} />
    <Stack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
  
    <Stack.Screen name={ROUTES.ADD_PRODUCT} component={AddProductScreen} />
    <Stack.Screen name={ROUTES.EDIT_PRODUCT} component={EditProductScreen} />
    <Stack.Screen name={ROUTES.ADD_CUSTOMER} component={AddCustomerScreen} />
    <Stack.Screen name={ROUTES.EDIT_CUSTOMER} component={EditCustomerScreen} />
    <Stack.Screen name={ROUTES.ADD_SUPPLIER} component={AddSupplierScreen} />
    <Stack.Screen name={ROUTES.EDIT_SUPPLIER} component={EditSupplierScreen} />
    <Stack.Screen name={ROUTES.ADD_EXPENSE} component={AddExpenseScreen} />
</Stack.Navigator>
);