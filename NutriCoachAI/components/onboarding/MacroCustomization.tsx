// components/MacroCustomization.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { calculateDailyNeeds } from '../../utils/nutritionCalculator';
import * as Haptics from 'expo-haptics';
import { UserProfile } from '../../types/nutrition';


interface MacroTargets {
  protein: number;
  carbs: number;
  fat: number;
}

interface TempInput {
  editingField: string;
  value: string;
}

const defaultTemp: TempInput = {
  editingField: '',
  value: '',
};

interface MacroCustomizationProps {
  profile: UserProfile;
  onUpdate: (data: any) => void;
  isModal?: boolean;
}

interface MacroInputProps {
  label: string;
  field: 'protein' | 'carbs' | 'fat';
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}

// **Move MacroInput here**
const MacroInput: React.FC<MacroInputProps> = ({ label, field, hint, value, onChange }) => (
  <View className="mb-4">
    <View className="flex-row justify-between mb-1">
      <Text className="text-gray-600">{label}</Text>
      {hint && <Text className="text-gray-400 text-sm">{hint}</Text>}
    </View>
    <TextInput
      className="bg-gray-50 p-4 rounded-xl border border-gray-200"
      keyboardType="numeric"
      value={value}
      onChangeText={onChange}
      placeholder={`Enter ${label.toLowerCase()}`}
      returnKeyType="done"
    />
  </View>
);

export function MacroCustomization({ profile, onUpdate, isModal = false }: MacroCustomizationProps) {
  const [calculatedMacros, setCalculatedMacros] = useState<MacroTargets>({
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const [macros, setMacros] = useState({
    protein: '',
    carbs: '',
    fat: '',
  });

  const [selectedType, setSelectedType] = useState<'automatic' | 'custom'>(profile.macroCalculation);

  useEffect(() => {
    const calculated = calculateDailyNeeds(profile);
    setCalculatedMacros(calculated);

    if (profile.customMacros) {
      setMacros({
        protein: profile.customMacros.protein.toString(),
        carbs: profile.customMacros.carbs.toString(),
        fat: profile.customMacros.fat.toString(),
      });
    }
  }, [profile]);

  const calculateCalories = (macros: { protein: string; carbs: string; fat: string }) => {
    const protein = parseInt(macros.protein) || 0;
    const carbs = parseInt(macros.carbs) || 0;
    const fat = parseInt(macros.fat) || 0;
    return protein * 4 + carbs * 4 + fat * 9;
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (selectedType === 'automatic') {
      onUpdate({
        macroCalculation: 'automatic',
        customMacros: undefined,
      });
    } else {
      const newMacros = {
        protein: parseInt(macros.protein) || 0,
        carbs: parseInt(macros.carbs) || 0,
        fat: parseInt(macros.fat) || 0,
      };

      onUpdate({
        macroCalculation: 'custom',
        customMacros: {
          ...newMacros,
          calories: calculateCalories(macros),
        },
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1">
        <View className="px-6">
          {!isModal && (
            <>
              <Text className="text-2xl font-bold text-gray-900">Daily Targets</Text>
              <Text className="text-gray-600 mt-2 mb-6">
                Choose how you want to set your daily macro targets
              </Text>
            </>
          )}

          {/* Selection Buttons */}
          <View className="flex-row gap-3 mb-6">
            <TouchableOpacity
              className={`flex-1 p-4 rounded-xl border ${
                selectedType === 'automatic'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200'
              }`}
              onPress={() => setSelectedType('automatic')}
            >
              <Text
                className={
                  selectedType === 'automatic'
                    ? 'text-green-500 font-medium'
                    : 'text-gray-900'
                }
              >
                Calculated
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 p-4 rounded-xl border ${
                selectedType === 'custom' ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}
              onPress={() => setSelectedType('custom')}
            >
              <Text
                className={
                  selectedType === 'custom' ? 'text-green-500 font-medium' : 'text-gray-900'
                }
              >
                Custom
              </Text>
            </TouchableOpacity>
          </View>

          {selectedType === 'automatic' ? (
            <View className="bg-gray-50 p-4 rounded-xl">
              <Text className="text-lg font-semibold mb-4">Calculated Daily Targets</Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Calories</Text>
                  <Text className="font-medium">
                    {calculatedMacros.protein * 4 +
                      calculatedMacros.carbs * 4 +
                      calculatedMacros.fat * 9}{' '}
                    kcal
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Protein</Text>
                  <Text className="font-medium">{calculatedMacros.protein}g</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Carbs</Text>
                  <Text className="font-medium">{calculatedMacros.carbs}g</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Fat</Text>
                  <Text className="font-medium">{calculatedMacros.fat}g</Text>
                </View>
              </View>
            </View>
          ) : (
            <View>
              <Text className="text-lg font-semibold mb-4">Custom Daily Targets</Text>
              <MacroInput
                label="Protein"
                field="protein"
                hint="4 calories per gram"
                value={macros.protein}
                onChange={(value) => {
                  setMacros((prev) => ({
                    ...prev,
                    protein: value,
                  }));
                }}
              />
              <MacroInput
                label="Carbs"
                field="carbs"
                hint="4 calories per gram"
                value={macros.carbs}
                onChange={(value) => {
                  setMacros((prev) => ({
                    ...prev,
                    carbs: value,
                  }));
                }}
              />
              <MacroInput
                label="Fat"
                field="fat"
                hint="9 calories per gram"
                value={macros.fat}
                onChange={(value) => {
                  setMacros((prev) => ({
                    ...prev,
                    fat: value,
                  }));
                }}
              />

              <View className="mt-4 p-4 bg-gray-50 rounded-xl">
                <Text className="text-lg font-semibold">Total Daily Calories</Text>
                <Text className="text-3xl font-bold text-green-500 mt-2">
                  {calculateCalories(macros)} kcal
                </Text>
              </View>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity className="mt-6 bg-green-500 p-4 rounded-xl" onPress={handleSave}>
            <Text className="text-white text-center font-semibold">Save Changes</Text>
          </TouchableOpacity>

          {/* Future ML Note */}
          <View className="mt-6 mb-6 bg-blue-50 p-4 rounded-xl">
            <Text className="text-sm text-blue-800">
              Coming Soon: Our AI will analyze your progress and suggest macro adjustments to help
              you reach your goals faster!
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
