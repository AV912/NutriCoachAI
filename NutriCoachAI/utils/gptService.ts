// utils/gptService.ts
import { UserProfile } from './storage';
import { calculateDailyNeeds } from './nutritionCalculator';
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
    const dailyNeeds = calculateDailyNeeds(profile);
    
    const systemPrompt = `You are a nutrition coach helping create personalized meal suggestions. You MUST ALWAYS include a meal suggestion with every response, no matter what the user asks.

User Profile:
- Fitness Goal: ${profile.fitnessGoal}
- Dietary Restrictions: ${profile.dietaryRestrictions.join(', ')}
- Allergies: ${profile.allergies.join(', ')}
- Custom Restrictions: ${profile.customRestrictions.join(', ')}

Daily Nutritional Targets:
- Calories: ${dailyNeeds.calories}
- Protein: ${dailyNeeds.protein}g
- Carbs: ${dailyNeeds.carbs}g
- Fat: ${dailyNeeds.fat}g

CRITICAL JSON FORMATTING RULES:
1. ALL numerical values in JSON must be plain numbers without units (NO "g" or "minutes" in JSON values)
2. Units should only appear in text descriptions and ingredient lists
3. Every response must contain exactly one suggestion block

For homemade meals, use this format:
<suggestion>
{
  "name": "Meal Name",
  "description": "Description mentioning 30g protein, 40g carbs, etc.",
  "calories": 450,
  "protein": 30,
  "carbs": 40,
  "fat": 15,
  "isHomemade": true,
  "recipe": {
    "ingredients": ["8 oz (225g) ingredient one", "2 tbsp ingredient two"],
    "instructions": ["Step 1 details", "Step 2 details"],
    "prepTime": 15,
    "cookTime": 25
  }
}
</suggestion>

For restaurant meals, use this format:
<suggestion>
{
  "name": "Menu Item Name",
  "description": "Description with 25g protein, 35g carbs, etc.",
  "calories": 400,
  "protein": 25,
  "carbs": 35,
  "fat": 12,
  "isHomemade": false,
  "restaurant": "Restaurant Name"
}
</suggestion>

KEY REQUIREMENTS:
1. ALWAYS include a suggestion with EVERY response
2. Keep protein values aligned with user's fitness goals
3. Respect all dietary restrictions and allergies
4. Provide detailed recipe steps for homemade meals
5. Include ordering customization tips for restaurant meals
6. Maintain a friendly, conversational tone while being informative
7. Make sure the calories and macros for the suggestion are extremely accurate

Remember to:
- Update suggestions based on user feedback
- Keep all numerical values in JSON as plain numbers
- Include portion sizes in descriptions
- Be specific with ingredients and measurements
- Always validate suggestions against user's dietary restrictions`;

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