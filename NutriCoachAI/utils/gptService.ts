// utils/gptService.ts
import { UserProfile } from './storage';
import { calculateDailyNeeds } from './nutritionCalculator';
import { useMealStore } from './mealTracking';
import Constants from 'expo-constants';

export interface RecipeDetails {
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
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

// Helper function to get time-appropriate meal suggestions
function getMealTypeBasedOnTime(): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
  const hour = new Date().getHours();
  if (hour < 10) return 'breakfast';
  if (hour < 15) return 'lunch';
  if (hour < 20) return 'dinner';
  return 'snack';
}

export async function generateMealSuggestion(
  userMessage: string,
  profile: UserProfile,
  conversationHistory: { role: 'user' | 'assistant', content: string }[]
): Promise<{ content: string; suggestion?: MealSuggestion }> {
  const apiKey = Constants.expoConfig?.extra?.openAiApiKey;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }

  try {
    const dailyTargets = calculateDailyNeeds(profile);
    const todayLog = useMealStore.getState().todayLog;
    const currentMealType = getMealTypeBasedOnTime();
    
    // Calculate remaining macros
    const remaining = {
      calories: Math.max(0, dailyTargets.calories - (todayLog?.totals.calories || 0)),
      protein: Math.max(0, dailyTargets.protein - (todayLog?.totals.protein || 0)),
      carbs: Math.max(0, dailyTargets.carbs - (todayLog?.totals.carbs || 0)),
      fat: Math.max(0, dailyTargets.fat - (todayLog?.totals.fat || 0))
    };

    // Get meal history for context
    const mealHistory = todayLog?.meals.map(meal => ({
      name: meal.name,
      mealType: meal.mealType,
      macros: {
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat
      }
    })) || [];

    const systemPrompt = `You are a nutrition coach helping create personalized meal suggestions.

User Profile & Context:
- Fitness Goal: ${profile.fitnessGoal}
- Dietary Restrictions: ${profile.dietaryRestrictions.join(', ')}
- Allergies: ${profile.allergies.join(', ')}
- Custom Restrictions: ${profile.customRestrictions.join(', ')}
- Current Time Suggests: ${currentMealType}
- Already Eaten Today: ${mealHistory.length > 0 ? JSON.stringify(mealHistory) : 'No meals logged yet'}

Remaining Daily Targets:
- Calories: ${remaining.calories} kcal
- Protein: ${remaining.protein}g
- Carbs: ${remaining.carbs}g
- Fat: ${remaining.fat}g

SUPER IMPORTANT CRITICAL FORMATTING RULES:
1. ALL numerical values in JSON must be plain numbers WITHOUT units
2. Units should only appear in descriptions and ingredients
3. Every response absolutely must contain exactly one suggestion

CORRECT FORMAT Example:
<suggestion>
{
  "name": "Protein Smoothie",
  "description": "Smoothie with 20g protein, 30g carbs, and 5g fat",
  "calories": 250,
  "protein": 20,
  "carbs": 30,
  "fat": 5,
  "isHomemade": true,
  "recipe": {
    "ingredients": ["1 scoop (30g) protein powder", "1 banana", "1 cup milk"],
    "instructions": ["Blend all ingredients", "Serve cold"],
    "prepTime": 5,
    "cookTime": 0
  }
}
</suggestion>

Your suggestions must:
1. Fit within remaining macros where possible
2. Respect all dietary restrictions and allergies
3. Be appropriate for the time of day
4. Include complete nutritional information
5. Be specific with portions

${remaining.calories < 200 ? 
  "WARNING: User has very few calories remaining. Suggest very light options." : ""}

${remaining.protein < 10 ? 
  "NOTE: Protein target almost met. Focus on other macros." : ""}`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    console.log('Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;
    let suggestion: MealSuggestion | undefined;

    const suggestionMatch = assistantMessage.match(/<suggestion>(.*?)<\/suggestion>/s);
    if (suggestionMatch) {
      try {
        suggestion = JSON.parse(suggestionMatch[1].trim());
      } catch (e) {
        console.error('Failed to parse suggestion:', e);
        console.error('Raw suggestion text:', suggestionMatch[1]);
      }
    } else {
      console.error('No suggestion found in response:', assistantMessage);
    }

    return {
      content: assistantMessage.replace(/<suggestion>.*?<\/suggestion>/s, '').trim(),
      suggestion
    };

  } catch (error) {
    console.error('Detailed error:', error);
    throw error;
  }
}