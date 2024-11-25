// components/ErrorMessage.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertOctagon } from 'lucide-react-native';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <View className="bg-red-50 p-4 rounded-xl border border-red-200">
      <View className="flex-row items-center">
        <AlertOctagon size={20} color="#DC2626" />
        <Text className="ml-2 text-red-700 font-medium">{message}</Text>
      </View>
      {onRetry && (
        <TouchableOpacity
          className="mt-2 bg-red-100 py-2 rounded-lg"
          onPress={onRetry}
        >
          <Text className="text-red-700 text-center font-medium">Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}