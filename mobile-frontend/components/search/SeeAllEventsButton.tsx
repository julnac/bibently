import { Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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
        <Text className="text-primary">See all events</Text>
        <Ionicons name="chevron-forward" size={20} color="black" />
    </Pressable>
  );
}

export default SeeAllEventsButton;