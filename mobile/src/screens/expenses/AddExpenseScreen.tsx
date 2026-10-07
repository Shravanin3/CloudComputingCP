import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { AppButton } from '../../components/common/AppButton';
import { createExpense } from '../../services/expenses/expenseService';
import { colors } from '../../constants/colors';

const SUGGESTED_CATEGORIES = [
  'Rent',
  'Electricity',
  'Supplies',
  'Tea & Snacks',
  'Staff Salary',
  'Transport',
  'Repair',
  'Packaging',
  'Other',
];

export const AddExpenseScreen = ({ navigation }: any) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Rent');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive expense amount.');
      return;
    }
    if (!category.trim()) {
      Alert.alert('Category Required', 'Please select or enter an expense category.');
      return;
    }

    setLoading(true);
    try {
      await createExpense({
        amount: amt,
        category: category.trim(),
        description: description.trim() || undefined,
      });
      Alert.alert('Expense Recorded', `Successfully recorded expense of ₹${amt} under ${category}.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || 'Failed to record expense';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer style={{ padding: 16 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <AppCard style={styles.card}>
          <Text style={styles.heading}>Record Shop Expense</Text>
          <Text style={styles.subheading}>
            All operational expenses directly deduct from gross profit in financial reports.
          </Text>

          {/* Amount input */}
          <AppInput
            label="Expense Amount (₹) *"
            placeholder="e.g. 2500"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          {/* Quick Category Chips */}
          <Text style={styles.label}>Select Category *</Text>
          <View style={styles.chipGrid}>
            {SUGGESTED_CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.chip,
                    isSelected ? styles.chipSelected : styles.chipUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom category if needed */}
          <AppInput
            label="Or Custom Category"
            placeholder="Type other category name"
            value={category}
            onChangeText={setCategory}
          />

          {/* Description */}
          <AppInput
            label="Description / Note (Optional)"
            placeholder="e.g. October shop rent paid to landlord"
            value={description}
            onChangeText={setDescription}
          />

          <View style={{ marginTop: 12 }}>
            <AppButton
              title="Save Expense"
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipUnselected: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.textWhite,
  },
  chipTextUnselected: {
    color: colors.textSecondary,
  },
});