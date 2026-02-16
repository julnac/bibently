import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

interface Props {
  placeholder?: string;
  onPress?: () => void;
  iconName?: ComponentProps<typeof Ionicons>["name"];
  editable?: boolean;
  value?: string;
}

const SearchBar = ({placeholder, onPress, iconName, editable = true, value}: Props) => {

  // If onPress is provided and editable is false, render as a button
  if (onPress && !editable) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 mx-3 mt-3">
          <Ionicons name={iconName} size={20} color="gray" />
          <Text className={`flex-1 ml-3 text-base ${value ? 'text-gray-900' : 'text-gray-400'}`}>
            {value || placeholder}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Otherwise render as a normal input field
  return (
    <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
        <Ionicons name={iconName} size={20} color="gray" />
        <TextInput
          onPress={onPress}
          placeholder={placeholder}
          className="flex-1 ml-3 text-base"
          placeholderTextColor="#999"
          value={value}
          numberOfLines={1}
        />
        <Pressable>
          <Ionicons name="close-circle-outline" size={20} color="#999" />
        </Pressable>
    </View>
  );
}

export default SearchBar;