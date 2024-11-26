// app/modals/edit-profile.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { getUserProfile, saveUserProfile, UserProfile } from '../../utils/storage';
import { router } from 'expo-router';
import { ArrowLeft, Check, Plus, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useProfileStore } from '../../utils/profileStore';

export default function EditProfileScreen() {
  const { profile: storeProfile, updateProfile } = useProfileStore();
  const [profile, setProfile] = useState<UserProfile | null>(storeProfile);
  const [newCustomRestriction, setNewCustomRestriction] = useState('');

  

  const handleSave = async () => {
    if (!profile) return;

    try {
      await updateProfile(profile);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      console.error('Error saving profile:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to save profile changes. Please try again.');
    }
  };

  const isValidRestriction = (restriction: string): boolean => {
    const trimmedRestriction = restriction.trim();
    
    // Check minimum length
    if (trimmedRestriction.length < 2) {
      return false;
    }

    // Check if it's already in dietary preferences
    if (profile?.dietaryRestrictions.some(
      diet => diet.toLowerCase() === trimmedRestriction.toLowerCase()
    )) {
      Alert.alert('Already Added', 'This restriction already exists in your dietary preferences.');
      return false;
    }

    // Check if it's already in allergies
    if (profile?.allergies.some(
      allergy => allergy.toLowerCase() === trimmedRestriction.toLowerCase()
    )) {
      Alert.alert('Already Added', 'This restriction already exists in your allergies.');
      return false;
    }

    // Check if it's a duplicate custom restriction
    if (profile?.customRestrictions.some(
      restriction => restriction.toLowerCase() === trimmedRestriction.toLowerCase()
    )) {
      Alert.alert('Duplicate', 'You have already added this restriction.');
      return false;
    }

    return true;
  };

  const handleAddCustomRestriction = () => {
    if (!profile) return;

    const trimmedRestriction = newCustomRestriction.trim();
    
    if (isValidRestriction(trimmedRestriction)) {
      setProfile(prev => ({
        ...prev!,
        customRestrictions: [...prev!.customRestrictions, trimmedRestriction]
      }));
      setNewCustomRestriction('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const SelectionButton = ({ 
    label, 
    value, 
    isSelected, 
    onPress 
  }: { 
    label: string;
    value: string;
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      className={`p-4 rounded-xl border mb-2 ${
        isSelected 
          ? 'border-green-500 bg-green-50' 
          : 'border-gray-200'
      }`}
      onPress={onPress}
    >
      <Text className={
        isSelected ? 'text-green-500 font-medium' : 'text-gray-900'
      }>
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="p-2"
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave}
          className="p-2"
        >
          <Check size={24} color="#22c55e" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        {/* Basic Information */}
        <View className="mb-8">
          <Text className="text-xl font-bold mb-4">Basic Information</Text>
          
          <View className="mb-4">
            <Text className="text-gray-600 mb-2">Weight</Text>
            <View className="flex-row items-center">
              <TextInput
                className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200 mr-2"
                keyboardType="numeric"
                value={profile.weight}
                onChangeText={(value) => setProfile(prev => ({ ...prev!, weight: value }))}
                placeholder="Enter weight"
              />
              <TouchableOpacity
                className="bg-gray-100 p-3 rounded-xl"
                onPress={() => setProfile(prev => ({
                  ...prev!,
                  weightUnit: prev!.weightUnit === 'kg' ? 'lb' : 'kg'
                }))}
              >
                <Text className="font-medium">{profile.weightUnit}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-600 mb-2">Height</Text>
            <View className="flex-row items-center space-x-2">
              <TextInput
                className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200"
                keyboardType="numeric"
                value={profile.heightFeetOrMeters}
                onChangeText={(value) => setProfile(prev => ({ ...prev!, heightFeetOrMeters: value }))}
                placeholder={profile.heightUnit === 'm/cm' ? 'Meters' : 'Feet'}
              />
              <TextInput
                className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200"
                keyboardType="numeric"
                value={profile.heightInchesOrCentimeters}
                onChangeText={(value) => setProfile(prev => ({ ...prev!, heightInchesOrCentimeters: value }))}
                placeholder={profile.heightUnit === 'm/cm' ? 'Centimeters' : 'Inches'}
              />
              <TouchableOpacity
                className="bg-gray-100 p-3 rounded-xl"
                onPress={() => setProfile(prev => ({
                  ...prev!,
                  heightUnit: prev!.heightUnit === 'm/cm' ? 'ft/in' : 'm/cm'
                }))}
              >
                <Text className="font-medium">{profile.heightUnit === 'm/cm' ? 'M' : 'FT'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Fitness Goals */}
        <View className="mb-8">
          <Text className="text-xl font-bold mb-4">Fitness Goal</Text>
          {['cutting', 'maintaining', 'bulking'].map((goal) => (
            <SelectionButton
              key={goal}
              label={goal.charAt(0).toUpperCase() + goal.slice(1)}
              value={goal}
              isSelected={profile.fitnessGoal === goal}
              onPress={() => setProfile(prev => ({ ...prev!, fitnessGoal: goal as any }))}
            />
          ))}
        </View>

        {/* Activity Level */}
        <View className="mb-8">
          <Text className="text-xl font-bold mb-4">Activity Level</Text>
          {[
            { value: 'sedentary', label: 'Sedentary (Office Job)' },
            { value: 'light', label: 'Lightly Active (1-2 days/week)' },
            { value: 'moderate', label: 'Moderately Active (3-5 days/week)' },
            { value: 'very', label: 'Very Active (6-7 days/week)' },
            { value: 'extreme', label: 'Extremely Active (Athlete)' }
          ].map((level) => (
            <SelectionButton
              key={level.value}
              label={level.label}
              value={level.value}
              isSelected={profile.activityLevel === level.value}
              onPress={() => setProfile(prev => ({ ...prev!, activityLevel: level.value }))}
            />
          ))}
        </View>

        {/* Dietary Preferences */}
        <View className="mb-8">
          <Text className="text-xl font-bold mb-4">Dietary Preferences</Text>
          <View className="flex-row flex-wrap gap-2">
            {[
              'Vegetarian',
              'Vegan',
              'Gluten-free',
              'Dairy-free',
              'Keto',
              'Paleo'
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
                  setProfile(prev => ({ ...prev!, dietaryRestrictions: newDiets }));
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

        {/* Allergies */}
        <View className="mb-8">
          <Text className="text-xl font-bold mb-4">Allergies</Text>
          <View className="flex-row flex-wrap gap-2">
            {[
              'Peanuts',
              'Tree Nuts',
              'Milk',
              'Eggs',
              'Soy',
              'Fish',
              'Shellfish',
              'Wheat'
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
                  setProfile(prev => ({ ...prev!, allergies: newAllergies }));
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

        {/* Additional Restrictions */}
        <View className="mb-8">
          <Text className="text-xl font-bold mb-4">Additional Restrictions</Text>
          
          {/* Input field for new restrictions */}
          <View className="flex-row items-center mb-4">
            <TextInput
              className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-200 mr-2"
              value={newCustomRestriction}
              onChangeText={setNewCustomRestriction}
              placeholder="Enter additional restriction"
              onSubmitEditing={handleAddCustomRestriction}
              maxLength={30}
            />
            <TouchableOpacity
              className={`p-4 rounded-xl ${
                newCustomRestriction.trim().length < 2 
                  ? 'bg-gray-300' 
                  : 'bg-green-500'
              }`}
              onPress={handleAddCustomRestriction}
              disabled={newCustomRestriction.trim().length < 2}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Character count */}
          <Text className="text-gray-500 text-xs mb-4 text-right">
            {newCustomRestriction.length}/30 characters
          </Text>

          {/* Display custom restrictions */}
          <View className="flex-row flex-wrap gap-2">
            {profile.customRestrictions.map((restriction, index) => (
              <View key={index} className="flex-row items-center">
                <TouchableOpacity
                  className="bg-gray-200 rounded-full px-4 py-2 flex-row items-center"
                  onPress={() => {
                    setProfile(prev => ({
                      ...prev!,
                      customRestrictions: prev!.customRestrictions.filter((_, i) => i !== index)
                    }));
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text className="text-gray-800 mr-2">{restriction}</Text>
                  <X size={16} color="#374151" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          {profile.customRestrictions.length === 0 && (
            <Text className="text-gray-500 text-sm mt-2">
              No additional restrictions added
            </Text>
          )}
        </View>

        {/* Add some bottom padding for better scrolling */}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}