import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

interface SearchHereButtonProps {
  onPress: () => void;
}

const SearchHereButton = ({ onPress }: SearchHereButtonProps) => {
  return (
    <View className="absolute top-1/4 left-0 right-0 items-center" style={{ marginTop: -20 }}>
      <Pressable
        onPress={onPress}
        className="flex-row items-center bg-white px-4 py-2 rounded-full shadow-lg"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
      >
        <Ionicons name="refresh-outline" size={16} color="black" />
        <Text className="ml-2 text-sm">Search here</Text>
      </Pressable>
    </View>
  );
};

export default SearchHereButton;
