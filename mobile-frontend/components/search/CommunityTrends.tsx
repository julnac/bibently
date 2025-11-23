import { Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CommunityTrends = () => {
  return (
    <View className="mt-6">
        <Text className="text-lg font-semibold mb-4">Community trends</Text>

        {[{title: "Neighborhood", sub: "Zabianka"}, 
        {title: "Climate", sub: "Cozy"}].map((item, i) => (
        <Pressable key={i} className="flex-row items-center py-4 border-b border-gray-200">
            <View className="w-10 h-10 rounded-lg bg-gray-300 mr-3" />
            <View className="flex-1">
            <Text className="font-medium">{item.title}</Text>
            <Text className="text-gray-500">{item.sub}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color="black" />
        </Pressable>
        ))}
    </View>
  );
}

export default CommunityTrends;