import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SearchHereButtonProps {
  onPress: () => void;
}

const SearchHereButton = ({ onPress }: SearchHereButtonProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View className="absolute top-1/4 left-0 right-0 items-center" style={{ marginTop: -25 }}>
      <Pressable
        onPress={onPress}
        className="flex-row items-center bg-gray-800 px-4 py-2 rounded-full shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Ionicons name="refresh-outline" size={16} color="white" />
        <Text className="ml-2 text-sm text-white">Szukaj tutaj</Text>
      </Pressable>
    </View>
  );
};

export default SearchHereButton;
