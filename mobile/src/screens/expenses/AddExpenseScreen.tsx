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
    const amt = Number(amount);
    if (!amt || amt <= 0 || !category.trim()) {
      Alert.alert('Error', 'Valid positive amount and category are required.');
      return;
    }
    setLoading(true);
    try {
      await createExpense({
        amount: amt,
        category: category.trim(),
        description: description.trim() || undefined,
      });
      Alert.alert('Success', 'Expense recorded successfully.');
      navigation.goBack();
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to record expense';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <AppInput label="Amount (₹)" placeholder="e.g. 1500" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <AppInput label="Category" placeholder="e.g. Rent, Electricity, Transport" value={category} onChangeText={setCategory} />
      <AppInput label="Description (Optional)" placeholder="e.g. Monthly shop rent" value={description} onChangeText={setDescription} />
      <AppButton title={loading ? 'Saving...' : 'Save Expense'} onPress={handleSave} disabled={loading} />
    </ScreenContainer>
  );
};