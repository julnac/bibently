import { Text, View} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextInput, Pressable } from "react-native-gesture-handler";

const LocationBar = () => {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-4">
        <Ionicons name="location-outline" size={20} color="gray" />
        <TextInput
        placeholder="Location"
        className="flex-1 ml-3 text-base"
        placeholderTextColor="#999"
        />
        <Pressable>
        <Ionicons name="close-circle-outline" size={20} color="#999" />
        </Pressable>
    </View>
  );
}

export default LocationBar;