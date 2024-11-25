// utils/nutritionCalculator.ts
import { UserProfile } from './storage';

interface DailyNeeds {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export function calculateBMR(profile: UserProfile): number {
  // Convert measurements if needed
  const weightInKg = profile.weightUnit === 'lb' 
    ? parseFloat(profile.weight) * 0.453592 
    : parseFloat(profile.weight);

  let heightInCm: number;
  if (profile.heightUnit === 'ft/in') {
    const feet = parseFloat(profile.heightFeetOrMeters) || 0;
    const inches = parseFloat(profile.heightInchesOrCentimeters) || 0;
    heightInCm = (feet * 30.48) + (inches * 2.54);
  } else {
    const meters = parseFloat(profile.heightFeetOrMeters) || 0;
    const cm = parseFloat(profile.heightInchesOrCentimeters) || 0;
    heightInCm = (meters * 100) + cm;
  }

  // Using Mifflin-St Jeor Equation
  // For men: BMR = 10W + 6.25H - 5A + 5
  // For women: BMR = 10W + 6.25H - 5A - 161
  // Using male calculation for now - you may want to add gender to UserProfile
  return (10 * weightInKg) + (6.25 * heightInCm) - (5 * 30) + 5; // Age hardcoded to 30 for now
}

export function calculateActivityMultiplier(activityLevel: string): number {
  switch (activityLevel) {
    case 'sedentary':
      return 1.2;
    case 'light':
      return 1.375;
    case 'moderate':
      return 1.55;
    case 'very':
      return 1.725;
    case 'extreme':
      return 1.9;
    default:
      return 1.2;
  }
}

export function calculateDailyNeeds(profile: UserProfile): DailyNeeds {
  const bmr = calculateBMR(profile);
  const activityMultiplier = calculateActivityMultiplier(profile.activityLevel);
  let maintenanceCalories = bmr * activityMultiplier;

  // Adjust calories based on goal
  let targetCalories: number;
  switch (profile.fitnessGoal) {
    case 'cutting':
      targetCalories = maintenanceCalories * 0.8; // 20% deficit
      break;
    case 'bulking':
      targetCalories = maintenanceCalories * 1.1; // 10% surplus
      break;
    default:
      targetCalories = maintenanceCalories;
  }

  // Calculate macros
  // Protein: 1g per pound of bodyweight for cutting/bulking, 0.8g for maintaining
  const weightInLbs = profile.weightUnit === 'lb' 
    ? parseFloat(profile.weight)
    : parseFloat(profile.weight) * 2.20462;

  const proteinMultiplier = profile.fitnessGoal === 'maintaining' ? 0.8 : 1;
  const proteinGrams = weightInLbs * proteinMultiplier;
  const proteinCalories = proteinGrams * 4;

  // Fat: 25% of total calories
  const fatCalories = targetCalories * 0.25;
  const fatGrams = fatCalories / 9;

  // Remaining calories from carbs
  const carbCalories = targetCalories - proteinCalories - fatCalories;
  const carbGrams = carbCalories / 4;

  return {
    calories: Math.round(targetCalories),
    protein: Math.round(proteinGrams),
    carbs: Math.round(carbGrams),
    fat: Math.round(fatGrams)
  };
}

// Helper function to calculate meal-specific portions
export function calculateMealPortions(dailyNeeds: DailyNeeds, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'): DailyNeeds {
  const mealMultipliers = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.35,
    snack: 0.05
  };

  const multiplier = mealMultipliers[mealType];
  
  return {
    calories: Math.round(dailyNeeds.calories * multiplier),
    protein: Math.round(dailyNeeds.protein * multiplier),
    carbs: Math.round(dailyNeeds.carbs * multiplier),
    fat: Math.round(dailyNeeds.fat * multiplier)
  };
}