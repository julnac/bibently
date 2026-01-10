import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

const SeeAllEventsButton = () => {
    const router = useRouter();

    const handleOpenMap = () => {
        router.push("/map/MapScreen");
    };

  return (
    <Pressable 
        className="flex-row items-center justify-between py-4"
        onPress={handleOpenMap}
    >
        <View className="flex-row items-center gap-2">
          <View className="w-10 h-10 rounded-lg bg-indigo-100 items-center justify-center mr-3">
            <Ionicons name="megaphone-outline" size={20} color="#3C46FF" />
          </View>
          <Text className="text-primary font-bold">See all events</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="black" />
    </Pressable>
  );
}

export default SeeAllEventsButton;