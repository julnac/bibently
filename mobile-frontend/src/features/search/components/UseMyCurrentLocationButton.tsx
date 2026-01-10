import { Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const UseMyCurrentLocationButton = () => {
  return (
    <Pressable className="flex-row items-center justify-between py-4">
        <Text className="text-primary">Use my current location</Text>
        <Ionicons name="chevron-forward" size={20} color="black" />
    </Pressable>
  );
}

export default UseMyCurrentLocationButton;