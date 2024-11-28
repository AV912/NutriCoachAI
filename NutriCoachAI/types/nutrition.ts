// types/nutrition.ts

export interface MacroTargets {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }
  
  export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
  export type FitnessGoal = 'cutting' | 'bulking' | 'maintaining';
  export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extreme';
  export type WeightUnit = 'lb' | 'kg';
  export type HeightUnit = 'ft/in' | 'm/cm';
  export type MacroCalculationType = 'automatic' | 'custom';
  
  export interface RecipeDetails {
    ingredients: string[];
    instructions: string[];
    prepTime: number;
    cookTime: number;
  }
  
  export interface UserProfile {
    fitnessGoal: FitnessGoal;
    dietaryRestrictions: string[];
    allergies: string[];
    customRestrictions: string[];
    activityLevel: ActivityLevel;
    weight: string;
    heightFeetOrMeters: string;
    heightInchesOrCentimeters: string;
    weightUnit: WeightUnit;
    heightUnit: HeightUnit;
    completedOnboarding?: boolean;
    macroCalculation: MacroCalculationType;
    customMacros?: MacroTargets;
  }
  
  export interface TrackedMeal {
    id: string;
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    timestamp: number;
    mealType: MealType;
    isHomemade: boolean;
    recipe?: RecipeDetails;
  }
  
  export interface DailyLog {
    date: string;
    meals: TrackedMeal[];
    totals: MacroTargets;
  }
  
  export interface MealSuggestion {
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    isHomemade: boolean;
    recipe?: RecipeDetails;
    restaurant?: string;
  }
  
  // Firestore specific types
  export interface FirestoreUserProfile extends UserProfile {
    userId: string;
    updatedAt: number;
  }
  
  export interface FirestoreMeal extends Omit<TrackedMeal, 'id'> {
    userId: string;
  }
  
  export interface FirestoreDailyLog {
    userId: string;
    date: string;
    meals: string[]; // Array of meal document IDs
    totals: MacroTargets;
    updatedAt: number;
  }