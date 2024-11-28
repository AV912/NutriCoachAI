// app/(auth)/register.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithPopup, AuthErrorCodes } from 'firebase/auth';
import { auth, googleProvider } from '../../services/firebase';

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long';
    case 'auth/missing-password':
      return 'Please enter a password';
    default:
      return 'An error occurred during registration';
  }
}

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    setError('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace('/(auth)/onboarding');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(getAuthErrorMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Check if it's a new user
      if (result.user.metadata.creationTime === result.user.metadata.lastSignInTime) {
        router.replace('/(auth)/onboarding');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Google sign up error:', error);
      setError('Failed to sign up with Google');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center p-6">
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900">Create Account</Text>
          <Text className="text-gray-600 mt-2">Sign up to get started</Text>
        </View>

        {error ? (
          <View className="mb-4 p-4 bg-red-50 rounded-xl">
            <Text className="text-red-600">{error}</Text>
          </View>
        ) : null}

        <View className="space-y-4">
          <TextInput
            className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          
          <TextInput
            className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200"
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password-new"
          />

          <TextInput
            className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="password-new"
          />

          <TouchableOpacity 
            className={`w-full p-4 rounded-xl ${isLoading ? 'bg-gray-400' : 'bg-green-500'}`}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-semibold">
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-full p-4 rounded-xl border border-gray-300 bg-white flex-row justify-center items-center space-x-2"
            onPress={handleGoogleSignUp}
          >
            <Text className="text-gray-700 font-semibold">Continue with Google</Text>
          </TouchableOpacity>
        </View>

        <Link href="/(auth)/login" asChild>
          <TouchableOpacity className="mt-6">
            <Text className="text-center text-gray-600">
              Already have an account? <Text className="text-green-500 font-semibold">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}