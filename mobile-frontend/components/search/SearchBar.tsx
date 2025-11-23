import { Text, View} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TextInput, Pressable } from "react-native-gesture-handler";
import { ComponentProps } from "react";

interface Props {
  placeholder?: string;
  onPress?: () => void;
  iconName?: ComponentProps<typeof Ionicons>["name"];
}

const SearchBar = ({placeholder, onPress, iconName}: Props) => {

  return (
    <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-4">
        <Ionicons name={iconName} size={20} color="gray" />
        <TextInput
          onPress={onPress}
          placeholder={placeholder}
          className="flex-1 ml-3 text-base"
          placeholderTextColor="#999"
        />
        <Pressable>
          <Ionicons name="close-circle-outline" size={20} color="#999" />
        </Pressable>
    </View>
  );
}

export default SearchBar;