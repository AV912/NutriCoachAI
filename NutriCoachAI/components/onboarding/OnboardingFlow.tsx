// components/onboarding/OnboardingFlow.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, SafeAreaView } from 'react-native';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';


// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../../utils/storage';
import { MacroCustomization } from './MacroCustomization';



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
  
interface OnboardingProps {
  onComplete: (data: UserProfile) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingProps) {
    const [step, setStep] = useState(1);
    const [profile, setProfile] = useState<UserProfile>({
      fitnessGoal: 'maintaining',
      dietaryRestrictions: [],
      allergies: [],
      customRestrictions: [],
      activityLevel: '',
      weight: '',
      heightFeetOrMeters: '',
      heightInchesOrCentimeters: '',
      weightUnit: 'lb',
      heightUnit: 'ft/in',
      macroCalculation: 'automatic',
      customMacros: undefined

    });
  const [customInput, setCustomInput] = useState('');

  // Helper function to handle adding custom restrictions
  const handleAddCustomRestriction = () => {
    if (customInput.trim()) {
      setProfile(prev => ({
        ...prev,
        customRestrictions: [...prev.customRestrictions, customInput.trim()]
      }));
      setCustomInput('');
    }
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 5) {  
      onComplete(profile);
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(prev => prev - 1);
  };

  const renderProgressBar = () => (
    <View className="flex-row w-full px-6 mt-2">
      {[1, 2, 3, 4, 5].map((idx) => (
        <View
          key={idx}
          className={`flex-1 h-1 mx-1 rounded-full ${
            idx <= step ? 'bg-green-500' : 'bg-gray-200'
          }`}
        />
      ))}
    </View>
  );

  const renderContent = () => {
    switch (step) {
        case 1:
            return (
              <View className="px-6">
                <Text className="text-2xl font-bold text-gray-900">Basic Info</Text>
                <Text className="text-gray-600 mt-2 mb-6">
                  Let's start with some basic information about you
                </Text>
          
                <View className="space-y-4">
                  {/* Weight */}
                  <View>
                    <Text className="text-gray-700 text-sm font-medium mb-1.5">
                      Weight
                    </Text>
                    <View className="flex-row items-center">
                      <TextInput
                        className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200 mr-2"
                        keyboardType="numeric"
                        value={profile.weight}
                        onChangeText={(value) => setProfile((prev) => ({ ...prev, weight: value }))}
                        placeholder="Enter your weight"
                        placeholderTextColor="#9CA3AF"
                      />
                      <TouchableOpacity
                        className="bg-gray-200 p-3 rounded-md"
                        onPress={() =>
                          setProfile((prev) => ({
                            ...prev,
                            weightUnit: prev.weightUnit === 'kg' ? 'lb' : 'kg',
                          }))
                        }
                      >
                        <Text className="text-gray-700 font-medium">
                          {profile.weightUnit || 'kg'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
          
                  {/* Height */}
                  <View>
                    <Text className="text-gray-700 text-sm font-medium mb-1.5">
                      Height
                    </Text>
                    <View className="flex-row items-center space-x-2">
                      {/* Field for Feet or Meters */}
                      <TextInput
                        className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200"
                        keyboardType="numeric"
                        value={profile.heightFeetOrMeters}
                        onChangeText={(value) =>
                          setProfile((prev) => ({
                            ...prev,
                            heightFeetOrMeters: value,
                          }))
                        }
                        placeholder={profile.heightUnit === 'm/cm' ? 'Meters' : 'Feet'}
                        placeholderTextColor="#9CA3AF"
                      />
                      {/* Field for Inches or Centimeters */}
                      <TextInput
                        className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200"
                        keyboardType="numeric"
                        value={profile.heightInchesOrCentimeters}
                        onChangeText={(value) =>
                          setProfile((prev) => ({
                            ...prev,
                            heightInchesOrCentimeters: value,
                          }))
                        }
                        placeholder={profile.heightUnit === 'm/cm' ? 'Centimeters' : 'Inches'}
                        placeholderTextColor="#9CA3AF"
                      />
                      <TouchableOpacity
                        className="bg-gray-200 p-3 rounded-md"
                        onPress={() =>
                          setProfile((prev) => ({
                            ...prev,
                            heightUnit: prev.heightUnit === 'm/cm' ? 'ft/in' : 'm/cm',
                          }))
                        }
                      >
                        <Text className="text-gray-700 font-medium">
                          {profile.heightUnit || 'cm'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          

      case 2:
        return (
          <View className="px-6">
            <Text className="text-2xl font-bold text-gray-900">Fitness Goals</Text>
            <Text className="text-gray-600 mt-2 mb-6">
              What's your primary fitness goal?
            </Text>

            {[
              {
                value: 'cutting',
                label: 'Fat Loss',
                description: 'Lose fat while maintaining muscle mass'
              },
              {
                value: 'bulking',
                label: 'Muscle Gain',
                description: 'Build muscle and increase strength'
              },
              {
                value: 'maintaining',
                label: 'Maintenance',
                description: 'Maintain current weight and body composition'
              }
            ].map((goal) => (
              <TouchableOpacity
                key={goal.value}
                className={`p-4 mb-3 rounded-xl border ${
                  profile.fitnessGoal === goal.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                }`}
                onPress={() => setProfile(prev => ({ ...prev, fitnessGoal: goal.value as any }))}
              >
                <Text className={`font-medium ${
                  profile.fitnessGoal === goal.value ? 'text-green-500' : 'text-gray-900'
                }`}>
                  {goal.label}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {goal.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

        case 3:
            return (
              <View className="px-6">
                <Text className="text-2xl font-bold text-gray-900">Dietary Preferences</Text>
                <Text className="text-gray-600 mt-2 mb-6">
                  Select any dietary preferences, restrictions, and allergies
                </Text>
    
                {/* Dietary Preferences Section */}
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-800 mb-3">
                    Dietary Preferences
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {[
                      'Vegetarian',
                      'Vegan',
                      'Pescatarian',
                      'Keto',
                      'Paleo',
                      'Mediterranean',
                      'Low-carb',
                      'Gluten-free',
                      'Dairy-free',
                    ].map((diet) => (
                      <TouchableOpacity
                        key={diet}
                        className={`rounded-full px-4 py-2 ${
                          profile.dietaryRestrictions.includes(diet)
                            ? 'bg-green-500'
                            : 'bg-gray-100'
                        }`}
                        onPress={() => {
                          const newDiets = profile.dietaryRestrictions.includes(diet)
                            ? profile.dietaryRestrictions.filter(d => d !== diet)
                            : [...profile.dietaryRestrictions, diet];
                          setProfile(prev => ({ ...prev, dietaryRestrictions: newDiets }));
                        }}
                      >
                        <Text
                          className={
                            profile.dietaryRestrictions.includes(diet)
                              ? 'text-white font-medium'
                              : 'text-gray-900'
                          }
                        >
                          {diet}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
    
                {/* Allergies Section */}
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-800 mb-3">
                    Allergies
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {[
                      'Peanuts',
                      'Tree Nuts',
                      'Milk',
                      'Eggs',
                      'Soy',
                      'Fish',
                      'Shellfish',
                      'Wheat',
                    ].map((allergy) => (
                      <TouchableOpacity
                        key={allergy}
                        className={`rounded-full px-4 py-2 ${
                          profile.allergies.includes(allergy)
                            ? 'bg-red-500'
                            : 'bg-gray-100'
                        }`}
                        onPress={() => {
                          const newAllergies = profile.allergies.includes(allergy)
                            ? profile.allergies.filter(a => a !== allergy)
                            : [...profile.allergies, allergy];
                          setProfile(prev => ({ ...prev, allergies: newAllergies }));
                        }}
                      >
                        <Text
                          className={
                            profile.allergies.includes(allergy)
                              ? 'text-white font-medium'
                              : 'text-gray-900'
                          }
                        >
                          {allergy}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
    
                {/* Custom Restrictions Section */}
                <View className="mb-6">
                  <Text className="text-lg font-semibold text-gray-800 mb-3">
                    Additional Restrictions
                  </Text>
                  <View className="flex-row items-center space-x-2 mb-3">
                    <TextInput
                      className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200"
                      value={customInput}
                      onChangeText={setCustomInput}
                      placeholder="Enter additional restriction"
                      placeholderTextColor="#9CA3AF"
                      onSubmitEditing={handleAddCustomRestriction}
                    />
                    <TouchableOpacity
                      className="bg-green-500 p-4 rounded-xl"
                      onPress={handleAddCustomRestriction}
                    >
                      <Text className="text-white font-medium">Add</Text>
                    </TouchableOpacity>
                  </View>
    
                  {/* Display Custom Restrictions */}
                  <View className="flex-row flex-wrap gap-2">
                    {profile.customRestrictions.map((restriction, index) => (
                      <View key={index} className="flex-row items-center">
                        <TouchableOpacity
                          className="bg-gray-200 rounded-full px-4 py-2 flex-row items-center"
                          onPress={() => {
                            setProfile(prev => ({
                              ...prev,
                              customRestrictions: prev.customRestrictions.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <Text className="text-gray-800 mr-2">{restriction}</Text>
                          <Text className="text-gray-600">×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            );

      case 4:
        return (
          <View className="px-6">
            <Text className="text-2xl font-bold text-gray-900">Activity Level</Text>
            <Text className="text-gray-600 mt-2 mb-6">
              How active are you during a typical week?
            </Text>

            {[
              {
                value: 'sedentary',
                label: 'Sedentary',
                description: 'Office job, minimal exercise'
              },
              {
                value: 'light',
                label: 'Lightly Active',
                description: 'Light exercise 1-2 times/week'
              },
              {
                value: 'moderate',
                label: 'Moderately Active',
                description: 'Moderate exercise 3-5 times/week'
              },
              {
                value: 'very',
                label: 'Very Active',
                description: 'Hard exercise 6-7 times/week'
              }
            ].map((level) => (
              <TouchableOpacity
                key={level.value}
                className={`p-4 mb-3 rounded-xl border ${
                  profile.activityLevel === level.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                }`}
                onPress={() => setProfile(prev => ({ ...prev, activityLevel: level.value }))}
              >
                <Text className={`font-medium ${
                  profile.activityLevel === level.value ? 'text-green-500' : 'text-gray-900'
                }`}>
                  {level.label}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {level.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 5:
        return (
            <MacroCustomization
              profile={profile}
              onUpdate={(updates) => setProfile(prev => ({ ...prev, ...updates }))}
            />
          );
      default: return null;

    //   case 5:
    //     return (
    //       <View className="px-6">
    //         <Text className="text-2xl font-bold text-gray-900">Weekly Budget</Text>
    //         <Text className="text-gray-600 mt-2 mb-6">
    //           What's your weekly food budget?
    //         </Text>

    //         <View>
    //           <Text className="text-gray-700 text-sm font-medium mb-1.5">
    //             Weekly Budget ($)
    //           </Text>
    //           <TextInput
    //             className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200"
    //             keyboardType="numeric"
    //             value={profile.budget}
    //             onChangeText={(value) => setProfile(prev => ({ ...prev, budget: value }))}
    //             placeholder="Enter your weekly budget"
    //             placeholderTextColor="#9CA3AF"
    //           />
    //           <Text className="text-sm text-gray-500 mt-2">
    //             This helps us suggest meals within your budget range
    //           </Text>
    //         </View>
    //       </View>
    //     );
    }
  };

  const renderNavigationButtons = () => (
    <View className="px-6 py-4 bg-white border-t border-gray-100">
      <View className="flex-row justify-between items-center">
        {step > 1 ? (
          <TouchableOpacity 
            onPress={handleBack}
            className="flex-row items-center"
          >
            <ArrowLeft size={20} color="#4B5563" />
            <Text className="ml-2 text-gray-600 font-medium">
              Back
            </Text>
          </TouchableOpacity>
        ) : <View />}

        <TouchableOpacity 
          onPress={handleNext}
          className="flex-row items-center bg-green-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-medium mr-2">
            {step === 5 ? 'Complete' : 'Continue'}
          </Text>
          <ArrowRight size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {renderProgressBar()}
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        {renderContent()}
      </ScrollView>
      {renderNavigationButtons()}
    </SafeAreaView>
  );
}