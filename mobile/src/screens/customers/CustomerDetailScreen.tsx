
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
