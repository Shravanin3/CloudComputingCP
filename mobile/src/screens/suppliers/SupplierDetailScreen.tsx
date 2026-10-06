
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
