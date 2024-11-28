// components/MealCard.tsx
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Alert, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Utensils, Trash2, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';

import { useMealStore } from '../utils/mealTracking';
import * as Haptics from 'expo-haptics';
import { TrackedMeal } from '../types/nutrition';

interface MealCardProps {
  meal: TrackedMeal;
}

export function MealCard({ meal }: MealCardProps) {
  const swipeableRef = useRef<Swipeable>(null);
  const { deleteMeal } = useMealStore();

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMeal(meal.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [64, 0],
    });

    return (
      <Animated.View
        className="bg-red-500 w-16 justify-center items-center"
        style={{ transform: [{ translateX: trans }] }}
      >
        <TouchableOpacity onPress={handleDelete} className="p-4">
          <Trash2 color="white" size={24} />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      friction={2}
      rightThreshold={40}
    >
      <View className="bg-white rounded-xl p-4 mb-2 border border-gray-100">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="font-medium text-gray-900">{meal.name}</Text>
            <Text className="text-gray-600 text-sm mt-1">{meal.description}</Text>
          </View>
          {meal.isHomemade && (
            <Utensils size={16} className="text-gray-400" />
          )}
        </View>

        <View className="flex-row justify-between mt-3">
          <View>
            <Text className="text-xs text-gray-500">Calories</Text>
            <Text className="font-medium">{meal.calories}</Text>
          </View>
          <View>
            <Text className="text-xs text-gray-500">Protein</Text>
            <Text className="font-medium">{meal.protein}g</Text>
          </View>
          <View>
            <Text className="text-xs text-gray-500">Carbs</Text>
            <Text className="font-medium">{meal.carbs}g</Text>
          </View>
          <View>
            <Text className="text-xs text-gray-500">Fat</Text>
            <Text className="font-medium">{meal.fat}g</Text>
          </View>
        </View>

        {meal.recipe && (
          <TouchableOpacity 
            className="mt-3 pt-3 border-t border-gray-100 flex-row items-center justify-between"
            onPress={() => router.push({
              pathname: '/modals/view-recipe',
              params: { id: meal.id }
            })}
          >
            <Text className="text-sm text-green-600 font-medium">View Recipe</Text>
            <ChevronRight size={16} color="#22c55e" />
          </TouchableOpacity>
        )}
      </View>
    </Swipeable>
  );
}