// utils/profileStore.ts
import { create } from 'zustand';
import { auth } from '../services/firebase';
import { firestoreService } from '../services/firestore';
import type { UserProfile } from '../types/nutrition';

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  loadProfile: async () => {
    const user = auth.currentUser;
    if (!user) return;

    set({ isLoading: true, error: null });
    try {
      const profile = await firestoreService.getProfile(user.uid);
      set({ profile });
    } catch (error) {
      console.error('Error loading profile:', error);
      set({ error: 'Failed to load profile' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (profile: UserProfile) => {
    const user = auth.currentUser;
    if (!user) return;

    set({ isLoading: true, error: null });
    try {
      await firestoreService.saveProfile(user.uid, profile);
      set({ profile });
    } catch (error) {
      console.error('Error updating profile:', error);
      set({ error: 'Failed to update profile' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));