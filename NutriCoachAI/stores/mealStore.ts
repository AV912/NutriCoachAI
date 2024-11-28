// stores/mealStore.ts
import { create } from 'zustand';
import { firestoreService } from '../services/firestore';
import type { DailyLog, TrackedMeal } from '../types/nutrition';

interface MealStore {
  todayLog: DailyLog | null;
  isLoading: boolean;
  error: string | null;
  refreshTodayLog: (userId: string) => Promise<void>;
  trackMeal: (userId: string, meal: Omit<TrackedMeal, 'id' | 'timestamp'>) => Promise<void>;
  deleteMeal: (userId: string, mealId: string) => Promise<void>;
}

const getTodayKey = () => new Date().toISOString().split('T')[0];

export const useMealStore = create<MealStore>((set, get) => ({
  todayLog: null,
  isLoading: false,
  error: null,

  refreshTodayLog: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const today = getTodayKey();
      const log = await firestoreService.getDailyLog(userId, today);
      
      if (!log) {
        // Initialize empty log for today
        set({
          todayLog: {
            date: today,
            meals: [],
            totals: { calories: 0, protein: 0, carbs: 0, fat: 0 }
          }
        });
      } else {
        set({ todayLog: log });
      }
    } catch (error) {
      console.error('Error refreshing daily log:', error);
      set({ error: 'Failed to refresh daily log' });
    } finally {
      set({ isLoading: false });
    }
  },

  trackMeal: async (userId: string, meal) => {
    set({ isLoading: true, error: null });
    try {
      const today = getTodayKey();
      await firestoreService.trackMeal(userId, today, {
        ...meal,
        timestamp: Date.now()
      });
      
      // Refresh the log to get updated data
      await get().refreshTodayLog(userId);
    } catch (error) {
      console.error('Error tracking meal:', error);
      set({ error: 'Failed to track meal' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteMeal: async (userId: string, mealId: string) => {
    set({ isLoading: true, error: null });
    try {
      const today = getTodayKey();
      await firestoreService.deleteMeal(userId, today, mealId);
      
      // Refresh the log to get updated data
      await get().refreshTodayLog(userId);
    } catch (error) {
      console.error('Error deleting meal:', error);
      set({ error: 'Failed to delete meal' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  }
}));