import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { updateCustomer } from '../../services/customers/customerService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../constants/colors';

export const EditCustomerScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const customer = route.params?.customer;

  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Required Field', 'Customer name is required.');
    if (!phone.trim() || phone.trim().length < 10) {
      return Alert.alert('Invalid Phone', 'Valid 10-digit phone number is required.');
    }

    setLoading(true);
    try {
      await updateCustomer(customer.id, { name: name.trim(), phone: phone.trim() });
      Alert.alert('Success', 'Customer details updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to update customer';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <AppCard style={styles.card}>
          <Text style={styles.heading}>Edit Customer Profile</Text>
          <Text style={styles.subheading}>
            Update contact information for #{customer?.id?.slice(0, 8)}
          </Text>

          <AppInput
            label="Customer Name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Ramesh Patil"
          />

          <AppInput
            label="Phone Number *"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="e.g. 9876543210"
          />

          <View style={{ marginTop: 12 }}>
            <AppButton
              title="Update Customer"
              variant="primary"
              loading={loading}
              onPress={handleSave}
            />
          </View>

          <View style={{ marginTop: 8 }}>
            <AppButton
              title="Cancel"
              variant="subtle"
              onPress={() => navigation.goBack()}
              disabled={loading}
            />
          </View>
        </AppCard>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 18,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subheading: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
});