// app/modals/edit-macros.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { MacroCustomization } from '../../components/onboarding/MacroCustomization';
import { getUserProfile, saveUserProfile } from '../../utils/storage';
import { UserProfile } from '../../utils/storage';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function EditMacrosScreen() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
  
    useEffect(() => {
      loadProfile();
    }, []);
  
    async function loadProfile() {
      const userProfile = await getUserProfile();
      setProfile(userProfile);
    }
  
    const handleSave = async (updates: Partial<UserProfile>) => {
      if (!profile) return;
      try {
        const updatedProfile = { ...profile, ...updates };
        await saveUserProfile(updatedProfile);
        // Force refresh before going back
        await loadProfile();
        router.back();
      } catch (error) {
        console.error('Error saving macro updates:', error);
      }
    };

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-2"
          >
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Edit Macros</Text>
          <View className="w-10" />
        </View>

        <MacroCustomization
          profile={profile}
          onUpdate={handleSave}
          isModal={true}
        />
      </SafeAreaView>
    </View>
  );
}