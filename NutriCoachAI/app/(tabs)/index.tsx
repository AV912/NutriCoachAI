// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { getUserProfile, UserProfile } from '../../utils/storage';
import { getTodayLog, DailyLog, TrackedMeal } from '../../utils/mealTracking';
import { calculateDailyNeeds } from '../../utils/nutritionCalculator';
import { Plus, Utensils, TrendingUp, ChevronRight } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyLog, setDailyLog] = useState<DailyLog | null>(null);
  const [dailyTargets, setDailyTargets] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const userProfile = await getUserProfile();
      const todayLog = await getTodayLog();
      
      if (userProfile) {
        setProfile(userProfile);
        const targets = calculateDailyNeeds(userProfile);
        setDailyTargets(targets);
      }
      
      setDailyLog(todayLog);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  const renderMealSection = (mealType: string, meals: TrackedMeal[]) => {
    const mealTypeFormatted = mealType.charAt(0).toUpperCase() + mealType.slice(1);
    const filteredMeals = meals.filter(meal => meal.mealType === mealType);

    return (
      <View className="mb-6">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-lg font-semibold text-gray-900">{mealTypeFormatted}</Text>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/coach')}
            className="flex-row items-center"
          >
            <Plus size={20} color="#22c55e" />
            <Text className="text-green-500 ml-1">Add</Text>
          </TouchableOpacity>
        </View>

        {filteredMeals.length > 0 ? (
          filteredMeals.map((meal, index) => (
            <View 
              key={meal.id} 
              className="bg-white rounded-xl p-4 mb-2 border border-gray-100"
            >
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
            </View>
          ))
        ) : (
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/coach')}
            className="bg-gray-50 rounded-xl p-4 border border-gray-100 border-dashed"
          >
            <Text className="text-gray-500 text-center">
              Tap to add {mealTypeFormatted.toLowerCase()}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const calculateProgress = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    return Math.min(percentage, 100);
  };

  const renderProgressBar = (label: string, current: number, target: number, unit: string, color: string) => (
    <View className="mb-4">
      <View className="flex-row justify-between mb-1">
        <Text className="text-sm text-gray-600">{label}</Text>
        <Text className="text-sm text-gray-600">
          {current} / {target}{unit}
        </Text>
      </View>
      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <View 
          className={`h-full ${color}`}
          style={{ width: `${calculateProgress(current, target)}%` }}
        />
      </View>
    </View>
  );

  if (!profile || !dailyLog) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Loading...</Text>
      </View>
    );
  }

  const totals = dailyLog.totals;

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="p-6 bg-green-500">
        <Text className="text-white text-lg">Welcome back!</Text>
        <Text className="text-white text-2xl font-bold mt-1">
          Today's Progress
        </Text>
      </View>

      {/* Progress Overview */}
      <View className="p-6">
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          {renderProgressBar('Calories', totals.calories, dailyTargets.calories, 'kcal', 'bg-green-500')}
          {renderProgressBar('Protein', totals.protein, dailyTargets.protein, 'g', 'bg-blue-500')}
          {renderProgressBar('Carbs', totals.carbs, dailyTargets.carbs, 'g', 'bg-purple-500')}
          {renderProgressBar('Fat', totals.fat, dailyTargets.fat, 'g', 'bg-yellow-500')}
        </View>
      </View>

      {/* Meals */}
      <View className="px-6">
        <Text className="text-xl font-bold mb-4">Today's Meals</Text>
        {renderMealSection('breakfast', dailyLog.meals)}
        {renderMealSection('lunch', dailyLog.meals)}
        {renderMealSection('dinner', dailyLog.meals)}
        {renderMealSection('snack', dailyLog.meals)}
      </View>
    </ScrollView>
  );
}