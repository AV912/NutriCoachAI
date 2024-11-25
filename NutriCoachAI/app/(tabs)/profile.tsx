// app/(tabs)/profile.tsx
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { clearUserProfile, getUserProfile, UserProfile } from '../../utils/storage';
import { useState, useEffect } from 'react';
import { User, Settings, AlertCircle } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const userProfile = await getUserProfile();
    setProfile(userProfile);
  }

  const formatHeight = (profile: UserProfile) => {
    if (profile.heightUnit === 'ft/in') {
      return `${profile.heightFeetOrMeters}'${profile.heightInchesOrCentimeters}"`;
    }
    return `${profile.heightFeetOrMeters}m ${profile.heightInchesOrCentimeters}cm`;
  };

  const formatWeight = (profile: UserProfile) => {
    return `${profile.weight} ${profile.weightUnit}`;
  };

  const formatBudget = (budget: string) => {
    return `$${budget}/week`;
  };

  const handleReset = async () => {
    Alert.alert(
      'Reset Profile',
      'Are you sure you want to reset your profile? This will take you back to onboarding.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearUserProfile();
            router.replace('/(auth)/onboarding');
          }
        }
      ]
    );
  };

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header */}
      <View className="p-6 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold">Profile</Text>
          <TouchableOpacity>
            <Settings size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="p-6 space-y-6">
        {/* Basic Info Card */}
        <View className="bg-gray-50 rounded-xl p-4">
          <View className="flex-row items-center mb-4">
            <User size={20} color="#374151" />
            <Text className="text-lg font-semibold ml-2">Basic Info</Text>
          </View>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Height</Text>
              <Text className="font-medium">{formatHeight(profile)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Weight</Text>
              <Text className="font-medium">{formatWeight(profile)}</Text>
            </View>
          </View>
        </View>

        {/* Goals & Activity Card */}
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

        {/* Dietary Preferences Card */}
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

        {/* Allergies Card */}
        {profile.allergies.length > 0 && (
          <View className="bg-gray-50 rounded-xl p-4">
            <View className="flex-row items-center mb-4">
              <AlertCircle size={20} color="#DC2626" />
              <Text className="text-lg font-semibold ml-2">Allergies</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {profile.allergies.map((allergy) => (
                <View key={allergy} className="bg-red-100 px-3 py-1 rounded-full">
                  <Text className="text-red-800">{allergy}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Additional Restrictions Card */}
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

        {/* Reset Button */}
        <TouchableOpacity 
          className="bg-red-500 p-4 rounded-xl mt-4"
          onPress={handleReset}
        >
          <Text className="text-white text-center font-semibold">
            Reset Profile
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}