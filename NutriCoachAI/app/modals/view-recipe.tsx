// app/modals/view-recipe.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock } from 'lucide-react-native';
import { useMealStore } from '../../utils/mealTracking';

export default function ViewRecipeScreen() {
  const { id } = useLocalSearchParams();
  const { todayLog } = useMealStore();
  
  const meal = todayLog?.meals.find(m => m.id === id);

  if (!meal?.recipe) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Recipe not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2"
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ml-2">Recipe</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Title and Description */}
        <Text className="text-2xl font-bold">{meal.name}</Text>
        <Text className="text-gray-600 mt-2 mb-6">{meal.description}</Text>

        {/* Time Info */}
        <View className="flex-row space-x-4 mb-6">
          <View className="flex-row items-center">
            <Clock size={16} className="text-gray-600" />
            <Text className="ml-2 text-gray-600">
              Prep: {meal.recipe.prepTime}min
            </Text>
          </View>
          <View className="flex-row items-center">
            <Clock size={16} className="text-gray-600" />
            <Text className="ml-2 text-gray-600">
              Cook: {meal.recipe.cookTime}min
            </Text>
          </View>
        </View>

        {/* Nutrition Info */}
        <View className="flex-row justify-between bg-gray-50 p-4 rounded-xl mb-6">
          <View>
            <Text className="text-sm text-gray-500">Calories</Text>
            <Text className="font-medium">{meal.calories}</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500">Protein</Text>
            <Text className="font-medium">{meal.protein}g</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500">Carbs</Text>
            <Text className="font-medium">{meal.carbs}g</Text>
          </View>
          <View>
            <Text className="text-sm text-gray-500">Fat</Text>
            <Text className="font-medium">{meal.fat}g</Text>
          </View>
        </View>

        {/* Ingredients */}
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-3">Ingredients</Text>
          {meal.recipe.ingredients.map((ingredient, index) => (
            <View 
              key={index} 
              className="flex-row items-center py-2 border-b border-gray-100"
            >
              <View className="w-2 h-2 rounded-full bg-green-500 mr-3" />
              <Text className="text-gray-700">{ingredient}</Text>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View>
          <Text className="text-lg font-semibold mb-3">Instructions</Text>
          {meal.recipe.instructions.map((step, index) => (
            <View key={index} className="mb-4">
              <View className="flex-row items-start">
                <View className="bg-green-500 w-6 h-6 rounded-full items-center justify-center mr-3 mt-0.5">
                  <Text className="text-white font-medium">{index + 1}</Text>
                </View>
                <Text className="flex-1 text-gray-700">{step}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}