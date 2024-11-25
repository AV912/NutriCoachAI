// app/(auth)/onboarding.tsx
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingFlow } from '../../components/onboarding/OnboardingFlow';
import { saveUserProfile } from '../../utils/storage';
import type { UserProfile } from '../../utils/storage';

export default function OnboardingScreen() {
  const router = useRouter();
  
  const handleComplete = async (data: UserProfile) => {
    try {
      await saveUserProfile(data);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <View className="flex-1 bg-white">
      <OnboardingFlow onComplete={handleComplete} />
    </View>
  );
}