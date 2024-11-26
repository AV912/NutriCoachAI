// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MacroTargets {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }


export interface UserProfile {
    fitnessGoal: 'cutting' | 'bulking' | 'maintaining';
    dietaryRestrictions: string[];
    allergies: string[];
    customRestrictions: string[];
    activityLevel: string;
    weight: string;
    heightFeetOrMeters: string;
    heightInchesOrCentimeters: string;
    weightUnit: 'lb' | 'kg';
    heightUnit: 'ft/in' | 'm/cm';
    completedOnboarding?: boolean;
    macroCalculation: 'automatic' | 'custom';
    customMacros?: MacroTargets;
  }

export const StorageKeys = {
  USER_PROFILE: 'user-profile',
} as const;

// Helper function to convert measurements
export function convertMeasurements(profile: UserProfile): {
  weightInKg: number;
  heightInCm: number;
} {
  let weightInKg: number;
  let heightInCm: number;

  // Convert weight to kg if needed
  if (profile.weightUnit === 'lb') {
    weightInKg = parseFloat(profile.weight) * 0.453592;
  } else {
    weightInKg = parseFloat(profile.weight);
  }

  // Convert height to cm if needed
  if (profile.heightUnit === 'ft/in') {
    const feet = parseFloat(profile.heightFeetOrMeters) || 0;
    const inches = parseFloat(profile.heightInchesOrCentimeters) || 0;
    heightInCm = (feet * 30.48) + (inches * 2.54);
  } else {
    const meters = parseFloat(profile.heightFeetOrMeters) || 0;
    const cm = parseFloat(profile.heightInchesOrCentimeters) || 0;
    heightInCm = (meters * 100) + cm;
  }

  return { weightInKg, heightInCm };
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    const measurements = convertMeasurements(profile);
    const profileToSave = {
      ...profile,
      completedOnboarding: true,
      weightInKg: measurements.weightInKg,
      heightInCm: measurements.heightInCm,
    };
    await AsyncStorage.setItem(
      StorageKeys.USER_PROFILE,
      JSON.stringify(profileToSave)
    );
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const profile = await AsyncStorage.getItem(StorageKeys.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

export async function clearUserProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(StorageKeys.USER_PROFILE);
  } catch (error) {
    console.error('Error clearing user profile:', error);
  }
}