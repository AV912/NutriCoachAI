// components/MealSuggestionCard.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp, Clock, UtensilsCrossed } from 'lucide-react-native';
import { MealSuggestion } from '../utils/gptService';

interface Props {
  suggestion: MealSuggestion;
  onTrack: (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => void;
}

export function MealSuggestionCard({ suggestion, onTrack }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View className="bg-white rounded-xl p-4">
      <Text className="font-bold text-gray-900">{suggestion.name}</Text>
      {suggestion.restaurant && (
        <Text className="text-green-600 text-sm mt-1">
          🏪 {suggestion.restaurant}
        </Text>
      )}
      <Text className="text-gray-600 mt-1">{suggestion.description}</Text>
      
      <View className="mt-3 flex-row justify-between">
        <View>
          <Text className="text-sm text-gray-500">Calories</Text>
          <Text className="font-medium">{suggestion.calories}</Text>
        </View>
        <View>
          <Text className="text-sm text-gray-500">Protein</Text>
          <Text className="font-medium">{suggestion.protein}g</Text>
        </View>
        <View>
          <Text className="text-sm text-gray-500">Carbs</Text>
          <Text className="font-medium">{suggestion.carbs}g</Text>
        </View>
        <View>
          <Text className="text-sm text-gray-500">Fat</Text>
          <Text className="font-medium">{suggestion.fat}g</Text>
        </View>
      </View>

      {suggestion.isHomemade && suggestion.recipe && (
        <View className="mt-4">
          <TouchableOpacity 
            className="flex-row items-center justify-between"
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <View className="flex-row items-center">
              <UtensilsCrossed size={16} className="text-gray-600" />
              <Text className="ml-2 font-medium text-gray-700">Recipe</Text>
            </View>
            {isExpanded ? (
              <ChevronUp size={20} className="text-gray-600" />
            ) : (
              <ChevronDown size={20} className="text-gray-600" />
            )}
          </TouchableOpacity>

          {isExpanded && (
            <View className="mt-4 space-y-4">
              <View className="flex-row items-center space-x-4">
                <View className="flex-row items-center">
                  <Clock size={16} className="text-gray-600" />
                  <Text className="ml-2 text-gray-600">
                    Prep: {suggestion.recipe.prepTime}min
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Clock size={16} className="text-gray-600" />
                  <Text className="ml-2 text-gray-600">
                    Cook: {suggestion.recipe.cookTime}min
                  </Text>
                </View>
              </View>

              <View>
                <Text className="font-medium text-gray-700 mb-2">Ingredients:</Text>
                {suggestion.recipe.ingredients.map((ingredient, index) => (
                  <Text key={index} className="text-gray-600 ml-4">
                    • {ingredient}
                  </Text>
                ))}
              </View>

              <View>
                <Text className="font-medium text-gray-700 mb-2">Instructions:</Text>
                {suggestion.recipe.instructions.map((step, index) => (
                  <Text key={index} className="text-gray-600 mb-2">
                    {index + 1}. {step}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      <View className="mt-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Track as:</Text>
        <View className="flex-row flex-wrap gap-2">
          {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => (
            <TouchableOpacity
              key={mealType}
              className="bg-green-500 rounded-full py-2 px-4"
              onPress={() => onTrack(mealType as any)}
            >
              <Text className="text-white capitalize">{mealType}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}