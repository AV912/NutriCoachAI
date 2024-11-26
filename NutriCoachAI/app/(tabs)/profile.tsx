// app/(tabs)/profile.tsx
import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Pencil } from 'lucide-react-native';
import { useProfileStore } from '../../utils/profileStore';

export default function ProfileScreen() {
    const { profile, loadProfile } = useProfileStore();
  
    useEffect(() => {
      loadProfile();
    }, []);
  
    if (!profile) {
      return (
        <View className="flex-1 items-center justify-center bg-white">
          <Text>Loading...</Text>
        </View>
      );
    }

  const formatHeight = () => {
    if (profile.heightUnit === 'ft/in') {
      return `${profile.heightFeetOrMeters}'${profile.heightInchesOrCentimeters}"`;
    }
    return `${profile.heightFeetOrMeters}m ${profile.heightInchesOrCentimeters}cm`;
  };

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="p-6 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold">Profile</Text>
          <TouchableOpacity
            onPress={() => router.push('/modals/edit-profile')}
            className="bg-gray-100 p-2 rounded-lg"
          >
            <Pencil size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Sections */}
      <View className="p-6 space-y-6">
        {/* Basic Info */}
        <View className="bg-gray-50 rounded-xl p-4">
          <Text className="text-lg font-semibold mb-4">Basic Info</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Height</Text>
              <Text className="font-medium">{formatHeight()}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Weight</Text>
              <Text className="font-medium">{profile.weight} {profile.weightUnit}</Text>
            </View>
          </View>
        </View>

        {/* Goals */}
        <View className="bg-gray-50 rounded-xl p-4">
          <Text className="text-lg font-semibold mb-4">Goals & Activity</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Fitness Goal</Text>
              <Text className="font-medium capitalize">{profile.fitnessGoal}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Activity Level</Text>
              <Text className="font-medium">{profile.activityLevel}</Text>
            </View>
          </View>
        </View>

        {/* Dietary Preferences */}
        {profile.dietaryRestrictions.length > 0 && (
          <View className="bg-gray-50 rounded-xl p-4">
            <Text className="text-lg font-semibold mb-4">Dietary Preferences</Text>
            <View className="flex-row flex-wrap gap-2">
              {profile.dietaryRestrictions.map((diet) => (
                <View key={diet} className="bg-green-100 px-3 py-1 rounded-full">
                  <Text className="text-green-800">{diet}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Allergies */}
        {profile.allergies.length > 0 && (
          <View className="bg-gray-50 rounded-xl p-4">
            <Text className="text-lg font-semibold mb-4">Allergies</Text>
            <View className="flex-row flex-wrap gap-2">
              {profile.allergies.map((allergy) => (
                <View key={allergy} className="bg-red-100 px-3 py-1 rounded-full">
                  <Text className="text-red-800">{allergy}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Custom Restrictions */}
        {profile.customRestrictions.length > 0 && (
          <View className="bg-gray-50 rounded-xl p-4">
            <Text className="text-lg font-semibold mb-4">Additional Restrictions</Text>
            <View className="flex-row flex-wrap gap-2">
              {profile.customRestrictions.map((restriction, index) => (
                <View key={index} className="bg-gray-200 px-3 py-1 rounded-full">
                  <Text className="text-gray-800">{restriction}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}