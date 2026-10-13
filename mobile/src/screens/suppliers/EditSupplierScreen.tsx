import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { updateSupplier } from '../../services/suppliers/supplierService';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../../constants/colors';

export const EditSupplierScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const supplier = route.params?.supplier;

  const [name, setName] = useState(supplier?.name || '');
  const [phone, setPhone] = useState(supplier?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('Required Field', 'Supplier name is required.');

    setLoading(true);
    try {
      await updateSupplier(supplier.id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
      });
      Alert.alert('Success', 'Supplier profile updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to update supplier';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <AppCard style={styles.card}>
          <Text style={styles.heading}>Edit Supplier Profile</Text>
          <Text style={styles.subheading}>
            Update contact details for #{supplier?.id?.slice(0, 8)}
          </Text>

          <AppInput
            label="Supplier / Firm Name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Mahavir Wholesalers"
          />

          <AppInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="e.g. 9876543210"
          />

          <View style={{ marginTop: 12 }}>
            <AppButton
              title="Update Supplier"
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