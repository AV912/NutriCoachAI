// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from '../contexts/auth';
import { router } from 'expo-router';

function RootLayoutNav() {
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/(auth)/login');
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="modals/edit-profile" 
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="modals/view-recipe" 
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name="modals/edit-macros" 
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}