// utils/profileStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from './storage';

const STORAGE_KEY = 'user-profile';

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  loadProfile: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,

  loadProfile: async () => {
    set({ isLoading: true });
    try {
      const storedProfile = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedProfile) {
        set({ profile: JSON.parse(storedProfile) });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (newProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      set({ profile: newProfile });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
}));