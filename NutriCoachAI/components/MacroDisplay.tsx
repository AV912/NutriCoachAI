// components/MacroDisplay.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Settings } from 'lucide-react-native';
import { router } from 'expo-router';

interface MacroDisplayProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  consumed: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export function MacroDisplay({ calories, protein, carbs, fat, consumed }: MacroDisplayProps) {
  const getProgressBarColor = (current: number, target: number, type: string) => {
    const percentage = (current / target) * 100;
    if (percentage > 100) {
      return type === 'calories' ? 'bg-red-500' : 'bg-orange-500';
    }
    switch (type) {
      case 'calories':
        return 'bg-green-500';
      case 'protein':
        return 'bg-blue-500';
      case 'carbs':
        return 'bg-purple-500';
      case 'fat':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const calculateProgress = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100);
  };

  const renderProgressBar = (label: string, current: number, target: number, unit: string, type: string) => (
    <View className="mb-4">
      <View className="flex-row justify-between mb-1">
        <Text className="text-sm text-gray-600">{label}</Text>
        <Text className={`text-sm ${current > target ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
          {current} / {target}{unit}
        </Text>
      </View>
      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <View 
          className={`h-full ${getProgressBarColor(current, target, type)}`}
          style={{ width: `${calculateProgress(current, target)}%` }}
        />
      </View>
      {current > target && (
        <Text className="text-xs text-red-500 mt-1">
          Exceeded by {Math.round(current - target)}{unit}
        </Text>
      )}
    </View>
  );

  return (
    <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold">Daily Targets</Text>
        <TouchableOpacity 
          onPress={() => router.push('/modals/edit-macros')}
          className="p-2 bg-gray-50 rounded-lg"
        >
          <Settings size={18} color="#374151" />
        </TouchableOpacity>
      </View>

      {renderProgressBar('Calories', consumed.calories, calories, 'kcal', 'calories')}
      {renderProgressBar('Protein', consumed.protein, protein, 'g', 'protein')}
      {renderProgressBar('Carbs', consumed.carbs, carbs, 'g', 'carbs')}
      {renderProgressBar('Fat', consumed.fat, fat, 'g', 'fat')}
    </View>
  );
}