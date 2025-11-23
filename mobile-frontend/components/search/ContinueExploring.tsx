import { Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ContinueExploring = () => {
  return (
    <View className="mt-6">
        <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold">Continue exploring</Text>
        <Pressable>
            <Text className="text-gray-500">Clear all</Text>
        </Pressable>
        </View>

        {/* Example Saved Item */}
        {Array(2).fill(0).map((_, i) => (
        <View key={i} className="flex-row items-start py-3 border-b border-gray-200">
            <View className="w-10 h-10 rounded-lg bg-gray-300 mr-3" />

            <View className="flex-1">
            <Text className="font-medium">Gdańsk, Poland</Text>
            <Text className="text-gray-500 text-sm">All events</Text>
            <Text className="text-gray-400 text-sm">Concert · Tomorrow · Free</Text>
            </View>

            <Pressable>
            <Ionicons name="close-outline" size={24} color="gray" />
            </Pressable>
        </View>
        ))}
    </View>
  );
}

export default ContinueExploring;