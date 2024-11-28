// app/(auth)/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../services/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(
        'Login Failed',
        error.code === 'auth/invalid-credential' 
          ? 'Invalid email or password'
          : 'An error occurred during login'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'Failed to sign in with Google');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center p-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900">Welcome</Text>
          <Text className="text-gray-600 mt-2">Sign in to continue</Text>
        </View>

        <View className="space-y-4">
          <TextInput
            className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            importantForAutofill="no"
          />
          
          <TextInput
            className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            importantForAutofill="no"
          />

          <TouchableOpacity 
            className={`w-full p-4 rounded-xl ${isLoading ? 'bg-gray-400' : 'bg-green-500'}`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-semibold">
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-full p-4 rounded-xl border border-gray-300 bg-white flex-row justify-center items-center space-x-2"
            onPress={handleGoogleLogin}
          >
            <Text className="text-gray-700 font-semibold">Continue with Google</Text>
          </TouchableOpacity>
        </View>

        <Link href="/(auth)/register" asChild>
          <TouchableOpacity className="mt-6">
            <Text className="text-center text-gray-600">
              Don't have an account? <Text className="text-green-500 font-semibold">Sign up</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}