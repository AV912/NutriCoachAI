// utils/mealTracking.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { TrackedMeal, DailyLog } from '../types/nutrition';

interface MealStore {
  todayLog: DailyLog | null;
  isLoading: boolean;
  refreshTodayLog: () => Promise<void>;
  trackMeal: (meal: Omit<TrackedMeal, 'id' | 'timestamp'>) => Promise<void>;
  deleteMeal: (mealId: string) => Promise<void>;
}

const STORAGE_KEYS = {
  DAILY_LOGS: 'daily-logs',
};

const getTodayKey = () => new Date().toISOString().split('T')[0];

export const useMealStore = create<MealStore>((set, get) => ({
  todayLog: null,
  isLoading: false,

  refreshTodayLog: async () => {
    set({ isLoading: true });
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

      set({ todayLog: allLogs[today] });
    } catch (error) {
      console.error('Error refreshing daily log:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  trackMeal: async (meal) => {
    set({ isLoading: true });
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

      // Add meal
      allLogs[today].meals.push(newMeal);

      // Update totals
      allLogs[today].totals = {
        calories: allLogs[today].totals.calories + meal.calories,
        protein: allLogs[today].totals.protein + meal.protein,
        carbs: allLogs[today].totals.carbs + meal.carbs,
        fat: allLogs[today].totals.fat + meal.fat,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(allLogs));
      set({ todayLog: allLogs[today] });
      
    } catch (error) {
      console.error('Error tracking meal:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteMeal: async (mealId: string) => {
    set({ isLoading: true });
    try {
      const logs = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
      const allLogs: Record<string, DailyLog> = logs ? JSON.parse(logs) : {};
      const today = getTodayKey();

      if (allLogs[today]) {
        const mealToDelete = allLogs[today].meals.find(meal => meal.id === mealId);
        if (mealToDelete) {
          // Remove meal
          allLogs[today].meals = allLogs[today].meals.filter(meal => meal.id !== mealId);
          
          // Update totals
          // Note: You'll need to store meals separately to update totals correctly
          await AsyncStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(allLogs));
          set({ todayLog: allLogs[today] });
        }
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));

// Keep these for backwards compatibility
export async function getTodayLog(): Promise<DailyLog> {
  const store = useMealStore.getState();
  if (!store.todayLog) {
    await store.refreshTodayLog();
  }
  return store.todayLog!;
}

export async function trackMeal(meal: Omit<TrackedMeal, 'id' | 'timestamp'>): Promise<void> {
  return useMealStore.getState().trackMeal(meal);
}