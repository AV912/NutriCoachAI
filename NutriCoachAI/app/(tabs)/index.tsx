// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getUserProfile} from '../../utils/storage';
import { calculateDailyNeeds } from '../../utils/nutritionCalculator';
import { Plus, Utensils, TrendingUp } from 'lucide-react-native';
import { useMealStore } from '../../utils/mealTracking';

import { MacroWarning } from '../../components/MacroWarning';
import { MealCard } from '../../components/MealCard';
import { MacroDisplay } from '../../components/MacroDisplay';
import { TrackedMeal, UserProfile } from '../../types/nutrition';


export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { todayLog, refreshTodayLog } = useMealStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyTargets, setDailyTargets] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    loadData();
    // Refresh data every 5 seconds
    const interval = setInterval(refreshTodayLog, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData(); // Reload data when the screen comes into focus
    });

    return () => unsubscribe();
  }, [navigation]);

  async function loadData() {
    try {
      const userProfile = await getUserProfile();
      await refreshTodayLog();
      
      if (userProfile) {
        setProfile(userProfile);
        // Check for custom macros
        if (userProfile.macroCalculation === 'custom' && userProfile.customMacros) {
          setDailyTargets(userProfile.customMacros);
        } else {
          const targets = calculateDailyNeeds(userProfile);
          setDailyTargets(targets);
        }
      }
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
          filteredMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
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

  if (!profile || !todayLog) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Loading...</Text>
      </View>
    );
  }

  const totals = todayLog.totals;

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
        <MacroDisplay
            calories={dailyTargets.calories}
            protein={dailyTargets.protein}
            carbs={dailyTargets.carbs}
            fat={dailyTargets.fat}
            consumed={todayLog.totals}
        />
        </View>

      {/* Macro Warning */}
      <MacroWarning 
        remaining={{
          calories: Math.max(0, dailyTargets.calories - totals.calories),
          protein: Math.max(0, dailyTargets.protein - totals.protein),
          carbs: Math.max(0, dailyTargets.carbs - totals.carbs),
          fat: Math.max(0, dailyTargets.fat - totals.fat)
        }}
        onDismiss={() => setShowWarning(false)}
      />


      {/* Meals */}
      <View className="px-6">
        <Text className="text-xl font-bold mb-4">Today's Meals</Text>
        {renderMealSection('breakfast', todayLog.meals as unknown as TrackedMeal[])}
        {renderMealSection('lunch', todayLog.meals as unknown as TrackedMeal[])}
        {renderMealSection('dinner', todayLog.meals as unknown as TrackedMeal[])}
        {renderMealSection('snack', todayLog.meals as unknown as TrackedMeal[])}
      </View>
    </ScrollView>
  );
}