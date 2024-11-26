// app/(auth)/onboarding.tsx
import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingFlow } from '../../components/onboarding/OnboardingFlow';
import { saveUserProfile } from '../../utils/storage';
import type { UserProfile } from '../../utils/storage';
import { useProfileStore } from '../../utils/profileStore';

export default function OnboardingScreen() {
  const router = useRouter();
  
  const handleComplete = async (data: UserProfile) => {
    try {
      await useProfileStore.getState().updateProfile(data);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <OnboardingFlow onComplete={handleComplete} />
    </View>
  );
}