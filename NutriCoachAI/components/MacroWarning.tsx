// components/MacroWarning.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertCircle, X } from 'lucide-react-native';

interface MacroWarningProps {
  remaining: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onDismiss: () => void;
}

export function MacroWarning({ remaining, onDismiss }: MacroWarningProps) {
  if (remaining.calories > 200 && remaining.protein > 10) {
    return null;
  }

  return (
    <View className="mx-6 mb-4 bg-orange-50 rounded-xl p-4 border border-orange-200">
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center">
          <AlertCircle size={20} color="#f97316" />
          <Text className="ml-2 font-medium text-orange-700">
            {remaining.calories < 200 ? 'Low Calories Remaining' : 'Protein Target Nearly Met'}
          </Text>
        </View>
        <TouchableOpacity onPress={onDismiss}>
          <X size={20} color="#f97316" />
        </TouchableOpacity>
      </View>
      
      <Text className="mt-2 text-orange-600">
        {remaining.calories < 200 
          ? `Only ${remaining.calories} calories remaining for today. Consider lighter options or adjusting your meal plan.`
          : `You're close to your protein goal! Focus on managing other macros.`}
      </Text>
    </View>
  );
}