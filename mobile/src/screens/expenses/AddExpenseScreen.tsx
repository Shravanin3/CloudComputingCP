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