// app/(tabs)/coach.tsx
import React, { useState, useRef, useEffect, useCallback} from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator 
} from 'react-native';
import { Send, Check } from 'lucide-react-native';
import { getUserProfile } from '../../utils/storage';

import { generateMealSuggestion } from '../../utils/gptService';
import { trackMeal } from '../../utils/mealTracking';
import { useMealStore } from '../../utils/mealTracking';
import * as Haptics from 'expo-haptics';
import { MealSuggestionCard } from '../../components/MealSuggestionCard';
import { router, useFocusEffect } from 'expo-router';
import { UserProfile } from '../../types/nutrition';


interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  suggestion?: MealSuggestion;
}

export interface RecipeDetails {
    ingredients: string[];
    instructions: string[];
    prepTime: number;
    cookTime: number;
  }

interface MealSuggestion {
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

export default function CoachScreen() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [lastProfileHash, setLastProfileHash] = useState<string>('');
    const scrollViewRef = useRef<ScrollView>(null);
  
    useFocusEffect(
        useCallback(() => {
          // Load profile when the screen is focused
          loadProfile();
      
          return () => {
            // Optional cleanup logic here
          };
        }, [])
      );
  
    useEffect(() => {
      if (profile) {
        // Create a hash of the entire profile to detect any changes
        const currentHash = JSON.stringify(profile);
        
        // If this is first load or if profile has changed
        if (!lastProfileHash || lastProfileHash !== currentHash) {
          setLastProfileHash(currentHash);
          
          // Reset chat with new greeting
          setMessages([
            {
              id: Date.now().toString(),
              type: 'assistant',
              content: `Hey there! I'm your NutriCoach AI. I know your goals include ${profile.fitnessGoal}, and I'll keep in mind your dietary preferences and restrictions. What kind of meal are you looking for?`
            }
          ]);
        }
      }
    }, [profile]);
  
    async function loadProfile() {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
    }

  const handleTrackMeal = async (suggestion: MealSuggestion, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    try {
      await useMealStore.getState().trackMeal({
        name: suggestion.name,
        description: suggestion.description,
        calories: suggestion.calories,
        protein: suggestion.protein,
        carbs: suggestion.carbs,
        fat: suggestion.fat,
        mealType,
        isHomemade: suggestion.isHomemade,
        recipe: suggestion.recipe
      });
  
      // Provide haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  
      // Add confirmation message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: `✅ Tracked ${suggestion.name} as ${mealType}! Would you like another suggestion?`
      }]);
  
    } catch (error) {
      console.error('Error tracking meal:', error);
      // Add error message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'assistant',
        content: "Sorry, I couldn't track that meal. Please try again."
      }]);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !profile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.type as 'user' | 'assistant',
        content: msg.content
      }));

      const response = await generateMealSuggestion(
        inputText.trim(),
        profile,
        conversationHistory
      );

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        suggestion: response.suggestion
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I'm having trouble generating a suggestion right now. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSuggestionCard = (suggestion: MealSuggestion) => (
    <View className="mt-4 bg-white rounded-xl p-4">
      <Text className="font-bold text-gray-900">{suggestion.name}</Text>
      <Text className="text-gray-600 mt-1">{suggestion.description}</Text>
      
      <View className="mt-3 flex-row justify-between">
        <View>
          <Text className="text-sm text-gray-500">Calories</Text>
          <Text className="font-medium">{suggestion.calories}</Text>
        </View>
        <View>
          <Text className="text-sm text-gray-500">Protein</Text>
          <Text className="font-medium">{suggestion.protein}g</Text>
        </View>
        <View>
          <Text className="text-sm text-gray-500">Carbs</Text>
          <Text className="font-medium">{suggestion.carbs}g</Text>
        </View>
        <View>
          <Text className="text-sm text-gray-500">Fat</Text>
          <Text className="font-medium">{suggestion.fat}g</Text>
        </View>
      </View>

      <View className="mt-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Track as:</Text>
        <View className="flex-row flex-wrap gap-2">
          {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => (
            <TouchableOpacity
              key={mealType}
              className="bg-green-500 rounded-full py-2 px-4"
              onPress={() => handleTrackMeal(suggestion, mealType as any)}
            >
              <Text className="text-white capitalize">{mealType}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderMessage = (message: Message) => (
    <View 
      key={message.id}
      className={`mb-4 max-w-[85%] ${
        message.type === 'user' ? 'self-end' : 'self-start'
      }`}
    >
      <View
        className={`rounded-2xl p-4 ${
          message.type === 'user' 
            ? 'bg-green-500' 
            : 'bg-gray-100'
        }`}
      >
        <Text
          className={message.type === 'user' ? 'text-white' : 'text-gray-800'}
        >
          {message.content}
        </Text>

        {message.suggestion && (
            <MealSuggestionCard 
                suggestion={message.suggestion}
                onTrack={(mealType) => handleTrackMeal(message.suggestion!, mealType)}
            />
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.map(renderMessage)}
        {isLoading && (
          <View className="self-start bg-gray-100 rounded-2xl p-4">
            <ActivityIndicator color="#22c55e" />
          </View>
        )}
      </ScrollView>

      <View className="p-4 border-t border-gray-200">
        <View className="flex-row items-center space-x-2">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-2"
            placeholder="Ask about meal suggestions..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            className="bg-green-500 p-2 rounded-full"
            onPress={handleSend}
          >
            <Send size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}