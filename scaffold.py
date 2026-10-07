import os
from pathlib import Path

base_dir = Path(r"d:\projects\clg sem 5\CC\cc_courseproject\mobile\src")

dirs = [
    "components/common",
    "screens/auth",
    "screens/home",
    "screens/pos",
    "screens/sales",
    "screens/products",
    "screens/inventory",
    "screens/customers",
    "screens/suppliers",
    "screens/expenses",
    "screens/reports",
    "screens/settings",
    "navigation",
    "services/api",
    "services/auth",
    "services/products",
    "services/inventory",
    "services/sales",
    "services/customers",
    "services/suppliers",
    "services/expenses",
    "services/reports",
    "services/dashboard",
    "types",
    "constants",
    "theme",
    "utils",
    "mock",
]

for d in dirs:
    (base_dir / d).mkdir(parents=True, exist_ok=True)

files = {
    # Constants
    "constants/colors.ts": """export const colors = {
  primary: '#1E40AF',
  background: '#F3F4F6',
  surface: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#E5E7EB',
};""",
    "constants/spacing.ts": """export const spacing = { xs: 4, s: 8, m: 16, l: 24, xl: 32, xxl: 48 };""",
    "constants/typography.ts": """export const typography = {
  h1: { fontSize: 24, fontWeight: 'bold' as const },
  h2: { fontSize: 20, fontWeight: 'bold' as const },
  body: { fontSize: 16 },
  caption: { fontSize: 12 },
};""",
    "constants/routes.ts": """export const ROUTES = {
  AUTH_LOGIN: 'AuthLogin',
  AUTH_REGISTER: 'AuthRegister',
  HOME: 'Home',
  NEW_BILL: 'NewBill',
  SALES: 'Sales',
  SALE_DETAIL: 'SaleDetail',
  PRODUCTS: 'Products',
  PRODUCT_DETAIL: 'ProductDetail',
  INVENTORY: 'Inventory',
  CUSTOMERS: 'Customers',
  CUSTOMER_DETAIL: 'CustomerDetail',
  SUPPLIERS: 'Suppliers',
  SUPPLIER_DETAIL: 'SupplierDetail',
  EXPENSES: 'Expenses',
  REPORTS: 'Reports',
  SETTINGS: 'Settings',
};""",
    "theme/index.ts": """import { colors } from '../constants/colors';
import { spacing } from '../constants/spacing';
import { typography } from '../constants/typography';
export const theme = { colors, spacing, typography };""",

    # Types
    "types/api.ts": """export interface ApiError { message: string; code?: string; }""",
    "types/auth.ts": """export interface User { id: string; name: string; email: string; }""",
    "types/product.ts": """export interface Category { id: string; name: string; }
export interface Product { id: string; name: string; price: number; categoryId?: string; stock: number; }""",
    "types/inventory.ts": """export interface InventoryItem { productId: string; quantity: number; }""",
    "types/sales.ts": """export interface SaleItem { productId: string; quantity: number; price: number; }
export interface Sale { id: string; items: SaleItem[]; total: number; date: string; customerId?: string; paymentMethod: string; }""",
    "types/customer.ts": """export interface Customer { id: string; name: string; contact: string; creditBalance: number; }""",
    "types/supplier.ts": """export interface Supplier { id: string; name: string; contact: string; payableBalance: number; }""",
    "types/expense.ts": """export interface Expense { id: string; amount: number; description: string; date: string; category: string; }""",
    "types/report.ts": """export interface SalesReport { revenue: number; }
export interface ProfitLossReport { revenue: number; cogs: number; grossProfit: number; netProfit: number; }""",
    "types/dashboard.ts": """export interface DashboardSummary { totalSales: number; expenses: number; cashReceived: number; pendingCredit: number; }""",

    # Mock
    "mock/products.ts": """import { Product } from '../types/product';
export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Product A', price: 100, stock: 50 },
  { id: '2', name: 'Product B', price: 200, stock: 5 },
];""",
    "mock/sales.ts": """import { Sale } from '../types/sales';
export const MOCK_SALES: Sale[] = [];""",
    "mock/customers.ts": """import { Customer } from '../types/customer';
export const MOCK_CUSTOMERS: Customer[] = [
  { id: '1', name: 'John Doe', contact: '1234567890', creditBalance: 500 }
];""",
    "mock/suppliers.ts": """import { Supplier } from '../types/supplier';
export const MOCK_SUPPLIERS: Supplier[] = [];""",
    "mock/expenses.ts": """import { Expense } from '../types/expense';
export const MOCK_EXPENSES: Expense[] = [];""",
    "mock/dashboard.ts": """import { DashboardSummary } from '../types/dashboard';
export const MOCK_DASHBOARD: DashboardSummary = {
  totalSales: 5000,
  expenses: 1200,
  cashReceived: 3800,
  pendingCredit: 500
};""",

    # Utils
    "utils/validation.ts": """export const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
export const isRequired = (value: string) => value.trim().length > 0;
export const isPositiveNumber = (value: number) => value > 0;""",
    "utils/formatters.ts": """export const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
export const formatDate = (date: string) => new Date(date).toLocaleDateString();""",

    # Services
    "services/api/endpoints.ts": """export const ENDPOINTS = {
  AUTH: { LOGIN: '/auth/login', REGISTER: '/auth/register', ME: '/me' },
  PRODUCTS: { BASE: '/products', CATEGORIES: '/categories' },
  INVENTORY: { BASE: '/inventory', RESTOCK: '/inventory/restock' },
  SALES: { BASE: '/sales' },
  CUSTOMERS: { BASE: '/customers' },
  SUPPLIERS: { BASE: '/suppliers' },
  EXPENSES: { BASE: '/expenses' },
  REPORTS: { SALES: '/reports/sales', PROFIT_LOSS: '/reports/profit-loss' },
  DASHBOARD: { SUMMARY: '/dashboard/summary' },
  HEALTH: '/health'
};""",
    "services/api/apiClient.ts": """import axios from 'axios';
// TODO: Use env config later
export const API_BASE_URL = 'http://localhost:3000/api/v1';
export const apiClient = axios.create({ baseURL: API_BASE_URL });""",
    "services/auth/authService.ts": """export const login = async () => { return { token: 'mock-token' }; };""",
    "services/products/productService.ts": """import { MOCK_PRODUCTS } from '../../mock/products';
export const getProducts = async () => MOCK_PRODUCTS;""",
    "services/inventory/inventoryService.ts": """export const getInventory = async () => [];""",
    "services/sales/salesService.ts": """import { MOCK_SALES } from '../../mock/sales';
export const getSales = async () => MOCK_SALES;""",
    "services/customers/customerService.ts": """import { MOCK_CUSTOMERS } from '../../mock/customers';
export const getCustomers = async () => MOCK_CUSTOMERS;""",
    "services/suppliers/supplierService.ts": """import { MOCK_SUPPLIERS } from '../../mock/suppliers';
export const getSuppliers = async () => MOCK_SUPPLIERS;""",
    "services/expenses/expenseService.ts": """import { MOCK_EXPENSES } from '../../mock/expenses';
export const getExpenses = async () => MOCK_EXPENSES;""",
    "services/reports/reportService.ts": """export const getSalesReport = async () => ({ revenue: 0 });""",
    "services/dashboard/dashboardService.ts": """import { MOCK_DASHBOARD } from '../../mock/dashboard';
export const getDashboardSummary = async () => MOCK_DASHBOARD;""",

    # Components
    "components/common/ScreenContainer.tsx": """import React from 'react'; import { SafeAreaView, StyleSheet, ViewStyle } from 'react-native'; import { colors } from '../../constants/colors';
export const ScreenContainer = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => (
  <SafeAreaView style={[styles.container, style]}>{children}</SafeAreaView>
);
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.background } });""",
    "components/common/AppButton.tsx": """import React from 'react'; import { TouchableOpacity, Text, StyleSheet } from 'react-native'; import { colors } from '../../constants/colors'; import { spacing } from '../../constants/spacing';
export const AppButton = ({ title, onPress, disabled }: { title: string, onPress: () => void, disabled?: boolean }) => (
  <TouchableOpacity style={[styles.button, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);
const styles = StyleSheet.create({ button: { backgroundColor: colors.primary, padding: spacing.m, borderRadius: 8, alignItems: 'center' }, disabled: { opacity: 0.5 }, text: { color: colors.surface, fontWeight: 'bold' } });""",
    "components/common/AppInput.tsx": """import React from 'react'; import { TextInput, StyleSheet, TextInputProps, View, Text } from 'react-native'; import { colors } from '../../constants/colors'; import { spacing } from '../../constants/spacing';
interface Props extends TextInputProps { label?: string; error?: string; }
export const AppInput = ({ label, error, ...props }: Props) => (
  <View style={styles.container}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput style={styles.input} placeholderTextColor={colors.textSecondary} {...props} />
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);
const styles = StyleSheet.create({ container: { marginBottom: spacing.m }, label: { color: colors.textPrimary, marginBottom: spacing.xs }, input: { borderWidth: 1, borderColor: colors.border, padding: spacing.m, borderRadius: 8, color: colors.textPrimary }, error: { color: colors.error, fontSize: 12, marginTop: spacing.xs } });""",
    "components/common/AppCard.tsx": """import React from 'react'; import { View, StyleSheet, ViewStyle } from 'react-native'; import { colors } from '../../constants/colors'; import { spacing } from '../../constants/spacing';
export const AppCard = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => (
  <View style={[styles.card, style]}>{children}</View>
);
const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.m, marginBottom: spacing.m, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 } });""",
    "components/common/LoadingState.tsx": """import React from 'react'; import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'; import { colors } from '../../constants/colors';
export const LoadingState = ({ message = 'Loading...' }: { message?: string }) => (
  <View style={styles.container}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.text}>{message}</Text></View>
);
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center' }, text: { marginTop: 8, color: colors.textSecondary } });""",
    "components/common/ErrorState.tsx": """import React from 'react'; import { View, Text, StyleSheet } from 'react-native'; import { colors } from '../../constants/colors'; import { AppButton } from './AppButton';
export const ErrorState = ({ message = 'An error occurred.', onRetry }: { message?: string, onRetry?: () => void }) => (
  <View style={styles.container}><Text style={styles.text}>{message}</Text>{onRetry && <AppButton title="Retry" onPress={onRetry} />}</View>
);
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }, text: { color: colors.error, marginBottom: 16, textAlign: 'center' } });""",
    "components/common/EmptyState.tsx": """import React from 'react'; import { View, Text, StyleSheet } from 'react-native'; import { colors } from '../../constants/colors';
export const EmptyState = ({ message = 'No data found.' }: { message?: string }) => (
  <View style={styles.container}><Text style={styles.text}>{message}</Text></View>
);
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }, text: { color: colors.textSecondary, textAlign: 'center' } });""",

    # Screens
    "screens/auth/LoginScreen.tsx": """import React from 'react'; import { View, Text } from 'react-native'; import { ScreenContainer } from '../../components/common/ScreenContainer'; import { AppInput } from '../../components/common/AppInput'; import { AppButton } from '../../components/common/AppButton'; import { ROUTES } from '../../constants/routes';
export const LoginScreen = ({ navigation }: any) => {
  return (
    <ScreenContainer style={{ padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>MSME FinTech</Text>
      <AppInput label="Email" placeholder="Enter email" keyboardType="email-address" />
      <AppInput label="Password" placeholder="Enter password" secureTextEntry />
      <AppButton title="Login" onPress={() => navigation.replace('App')} />
      <AppButton title="Register" onPress={() => navigation.navigate(ROUTES.AUTH_REGISTER)} />
    </ScreenContainer>
  );
};""",
    "screens/auth/RegisterScreen.tsx": """import React from 'react'; import { Text } from 'react-native'; import { ScreenContainer } from '../../components/common/ScreenContainer'; import { AppInput } from '../../components/common/AppInput'; import { AppButton } from '../../components/common/AppButton'; import { ROUTES } from '../../constants/routes';
export const RegisterScreen = ({ navigation }: any) => {
  return (
    <ScreenContainer style={{ padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>Register Shop</Text>
      <AppInput label="Shop Name" placeholder="Enter shop name" />
      <AppInput label="Email" placeholder="Enter email" keyboardType="email-address" />
      <AppInput label="Password" placeholder="Enter password" secureTextEntry />
      <AppInput label="Confirm Password" placeholder="Confirm password" secureTextEntry />
      <AppButton title="Register" onPress={() => navigation.navigate(ROUTES.AUTH_LOGIN)} />
      <AppButton title="Back to Login" onPress={() => navigation.goBack()} />
    </ScreenContainer>
  );
};""",
    "screens/home/HomeScreen.tsx": """import React from 'react'; import { View, Text, ScrollView } from 'react-native'; import { ScreenContainer } from '../../components/common/ScreenContainer'; import { AppCard } from '../../components/common/AppCard'; import { AppButton } from '../../components/common/AppButton'; import { ROUTES } from '../../constants/routes'; import { MOCK_DASHBOARD } from '../../mock/dashboard';
export const HomeScreen = ({ navigation }: any) => {
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Dashboard</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <AppCard style={{ flex: 1, marginRight: 8 }}><Text>Sales</Text><Text style={{fontSize:20}}>${MOCK_DASHBOARD.totalSales}</Text></AppCard>
          <AppCard style={{ flex: 1, marginLeft: 8 }}><Text>Expenses</Text><Text style={{fontSize:20}}>${MOCK_DASHBOARD.expenses}</Text></AppCard>
        </View>
        <AppButton title="New Bill (POS)" onPress={() => navigation.navigate(ROUTES.NEW_BILL)} />
        <View style={{ marginTop: 16 }}>
          <AppButton title="Products" onPress={() => navigation.navigate(ROUTES.PRODUCTS)} />
          <AppButton title="Inventory" onPress={() => navigation.navigate(ROUTES.INVENTORY)} />
          <AppButton title="Sales" onPress={() => navigation.navigate(ROUTES.SALES)} />
          <AppButton title="Customers" onPress={() => navigation.navigate(ROUTES.CUSTOMERS)} />
          <AppButton title="Suppliers" onPress={() => navigation.navigate(ROUTES.SUPPLIERS)} />
          <AppButton title="Expenses" onPress={() => navigation.navigate(ROUTES.EXPENSES)} />
          <AppButton title="Reports" onPress={() => navigation.navigate(ROUTES.REPORTS)} />
          <AppButton title="Settings" onPress={() => navigation.navigate(ROUTES.SETTINGS)} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};""",
    "screens/pos/NewBillScreen.tsx": """import React from 'react'; import { Text } from 'react-native'; import { ScreenContainer } from '../../components/common/ScreenContainer';
export const NewBillScreen = () => <ScreenContainer style={{padding: 16}}><Text>New Bill (POS) Screen Placeholder</Text></ScreenContainer>;""",
    "screens/sales/SalesScreen.tsx": """import React from 'react'; import { Text } from 'react-native'; import { ScreenContainer } from '../../components/common/ScreenContainer';
export const SalesScreen = () => <ScreenContainer style={{padding: 16}}><Text>Sales Screen Placeholder</Text></ScreenContainer>;""",
    "screens/sales/SaleDetailScreen.tsx": """import React from 'react'; import { Text } from 'react-native'; import { ScreenContainer } from '../../components/common/ScreenContainer';
export const SaleDetailScreen = () => <ScreenContainer style={{padding: 16}}><Text>Sale Detail Screen Placeholder</Text></ScreenContainer>;""",
    "screens/products/ProductsScreen.tsx": """import React from 'react'; import { Text } from 'react-native'; import { ScreenContainer } from '../../components/common/ScreenContainer';
export const ProductsScreen = () => <ScreenContainer style={{padding: 16}}><Text>Products Screen Placeholder</Text></ScreenContainer>;""",
    "screens/products/ProductDetailScreen.tsx": """import React from 'react'; import { Text } from 'react-native'; import { ScreenContainer } from '../../components/common/ScreenContainer';
export const ProductDetailScreen = () => <ScreenContainer style={{padding: 16}}><Text>Product Detail Screen Placeholder</Text></ScreenContainer>;""",
    "screens/inventory/InventoryScreen.tsx": """import React from 'react'; import { Text } from 'react-native'; import { ScreenContainer } from '../../components/common/ScreenContainer';
export const InventoryScreen = () => <ScreenContainer style={{padding: 16}}><Text>Inventory Screen Placeholder</Text></ScreenContainer>;""",
    "screens/customers/CustomersScreen.tsx": """import React from 'react'; import { Text } from 'react-native'; import { ScreenContainer } from '../../components/common/ScreenContainer';
export const CustomersScreen = () => <ScreenContainer style={{padding: 16}}><Text>Customers Screen Placeholder</Text></ScreenContainer>;""",
    "screens/customers/CustomerDetailScreen.tsx": """import React from 'react'; import { Text } from 'react-native'; import { ScreenContainer } from '../../components/common/ScreenContainer';
export const CustomerDetailScreen = () => <ScreenContainer style={{padding: 16}}><Text>Customer Detail Screen Placeholder</Text></ScreenContainer>;""",
    "screens/suppliers/SuppliersScreen.tsx": """import React from 'react'; import { Text } from 'react-native'; import { ScreenContainer } from '../../components/common/ScreenContainer';
export const SuppliersScreen = () => <ScreenContainer style={{padding: 16}}><Text>Suppliers Screen Placeholder</Text></ScreenContainer>;""",
    "screens/suppliers/SupplierDetailScreen.tsx": """import React from 'react'; import { Text } from 'react-native'; import { ScreenContainer } from '../../components/common/ScreenContainer';
export const SupplierDetailScreen = () => <ScreenContainer style={{padding: 16}}><Text>Supplier Detail Screen Placeholder</Text></ScreenContainer>;""",
    "screens/expenses/ExpensesScreen.tsx": """import React from 'react'; import { Text } from 'react-native'; import { ScreenContainer } from '../../components/common/ScreenContainer';
export const ExpensesScreen = () => <ScreenContainer style={{padding: 16}}><Text>Expenses Screen Placeholder</Text></ScreenContainer>;""",
    "screens/reports/ReportsScreen.tsx": """import React from 'react'; import { Text } from 'react-native'; import { ScreenContainer } from '../../components/common/ScreenContainer';
export const ReportsScreen = () => <ScreenContainer style={{padding: 16}}><Text>Reports Screen Placeholder</Text></ScreenContainer>;""",
    "screens/settings/SettingsScreen.tsx": """import React from 'react'; import { Text } from 'react-native'; import { ScreenContainer } from '../../components/common/ScreenContainer'; import { AppButton } from '../../components/common/AppButton'; import { ROUTES } from '../../constants/routes';
export const SettingsScreen = ({ navigation }: any) => (
  <ScreenContainer style={{padding: 16}}>
    <Text style={{fontSize: 24, marginBottom: 16}}>Settings</Text>
    <AppButton title="Logout" onPress={() => navigation.replace('Auth')} />
  </ScreenContainer>
);""",

    # Navigation
    "navigation/AuthNavigator.tsx": """import React from 'react'; import { createNativeStackNavigator } from '@react-navigation/native-stack'; import { LoginScreen } from '../screens/auth/LoginScreen'; import { RegisterScreen } from '../screens/auth/RegisterScreen'; import { ROUTES } from '../constants/routes';
const Stack = createNativeStackNavigator();
export const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={ROUTES.AUTH_LOGIN} component={LoginScreen} />
    <Stack.Screen name={ROUTES.AUTH_REGISTER} component={RegisterScreen} />
  </Stack.Navigator>
);""",
    "navigation/AppNavigator.tsx": """import React from 'react'; import { createNativeStackNavigator } from '@react-navigation/native-stack'; import { HomeScreen } from '../screens/home/HomeScreen'; import { NewBillScreen } from '../screens/pos/NewBillScreen'; import { SalesScreen } from '../screens/sales/SalesScreen'; import { SaleDetailScreen } from '../screens/sales/SaleDetailScreen'; import { ProductsScreen } from '../screens/products/ProductsScreen'; import { ProductDetailScreen } from '../screens/products/ProductDetailScreen'; import { InventoryScreen } from '../screens/inventory/InventoryScreen'; import { CustomersScreen } from '../screens/customers/CustomersScreen'; import { CustomerDetailScreen } from '../screens/customers/CustomerDetailScreen'; import { SuppliersScreen } from '../screens/suppliers/SuppliersScreen'; import { SupplierDetailScreen } from '../screens/suppliers/SupplierDetailScreen'; import { ExpensesScreen } from '../screens/expenses/ExpensesScreen'; import { ReportsScreen } from '../screens/reports/ReportsScreen'; import { SettingsScreen } from '../screens/settings/SettingsScreen'; import { ROUTES } from '../constants/routes';
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
  </Stack.Navigator>
);""",
    "navigation/RootNavigator.tsx": """import React from 'react'; import { NavigationContainer } from '@react-navigation/native'; import { createNativeStackNavigator } from '@react-navigation/native-stack'; import { AuthNavigator } from './AuthNavigator'; import { AppNavigator } from './AppNavigator';
const Stack = createNativeStackNavigator();
export const RootNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="App" component={AppNavigator} />
    </Stack.Navigator>
  </NavigationContainer>
);""",

}

for filepath, content in files.items():
    (base_dir / filepath).write_text(content, encoding="utf-8")

# Replace App.tsx in the mobile root
app_tsx = Path(r"d:\projects\clg sem 5\CC\cc_courseproject\mobile\App.tsx")
app_tsx.write_text('''import React from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return <RootNavigator />;
}
''', encoding="utf-8")

print("Scaffold complete.")
