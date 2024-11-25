// utils/mealTracking.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TrackedMeal {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  isHomemade?: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD format
  meals: TrackedMeal[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const STORAGE_KEYS = {
  DAILY_LOGS: 'daily-logs',
};

// Get today's date in YYYY-MM-DD format
const getTodayKey = () => new Date().toISOString().split('T')[0];

// Initialize or get today's log
export async function getTodayLog(): Promise<DailyLog> {
  try {
    const logs = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    const allLogs: Record<string, DailyLog> = logs ? JSON.parse(logs) : {};
    const today = getTodayKey();

    if (!allLogs[today]) {
      allLogs[today] = {
        date: today,
        meals: [],
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 }
      };
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(allLogs));
    }

    return allLogs[today];
  } catch (error) {
    console.error('Error getting daily log:', error);
    throw error;
  }
}

// Track a new meal
export async function trackMeal(meal: Omit<TrackedMeal, 'id' | 'timestamp'>): Promise<void> {
  try {
    const logs = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    const allLogs: Record<string, DailyLog> = logs ? JSON.parse(logs) : {};
    const today = getTodayKey();

    const newMeal: TrackedMeal = {
      ...meal,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    if (!allLogs[today]) {
      allLogs[today] = {
        date: today,
        meals: [],
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 }
      };
    }

    // Add meal and update totals
    allLogs[today].meals.push(newMeal);
    allLogs[today].totals = {
      calories: allLogs[today].totals.calories + meal.calories,
      protein: allLogs[today].totals.protein + meal.protein,
      carbs: allLogs[today].totals.carbs + meal.carbs,
      fat: allLogs[today].totals.fat + meal.fat,
    };

    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(allLogs));
  } catch (error) {
    console.error('Error tracking meal:', error);
    throw error;
  }
}

// Get logs for a specific date range
export async function getLogs(days: number = 7): Promise<DailyLog[]> {
  try {
    const logs = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    const allLogs: Record<string, DailyLog> = logs ? JSON.parse(logs) : {};
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateRange = [];
    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      dateRange.push(d.toISOString().split('T')[0]);
    }

    return dateRange.map(date => allLogs[date] || {
      date,
      meals: [],
      totals: { calories: 0, protein: 0, carbs: 0, fat: 0 }
    });
  } catch (error) {
    console.error('Error getting logs:', error);
    throw error;
  }
}

// Delete a tracked meal
export async function deleteMeal(mealId: string): Promise<void> {
  try {
    const logs = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    const allLogs: Record<string, DailyLog> = logs ? JSON.parse(logs) : {};
    const today = getTodayKey();

    if (allLogs[today]) {
      const mealToDelete = allLogs[today].meals.find(meal => meal.id === mealId);
      if (mealToDelete) {
        allLogs[today].meals = allLogs[today].meals.filter(meal => meal.id !== mealId);
        allLogs[today].totals = {
          calories: allLogs[today].totals.calories - mealToDelete.calories,
          protein: allLogs[today].totals.protein - mealToDelete.protein,
          carbs: allLogs[today].totals.carbs - mealToDelete.carbs,
          fat: allLogs[today].totals.fat - mealToDelete.fat,
        };
      }
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(allLogs));
    }
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
}