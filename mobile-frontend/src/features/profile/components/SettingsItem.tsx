import { Pressable, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  isDark: boolean;
  color?: string;
}

const SettingsItem = ({ icon, label, value, onPress, isDark, color }: SettingsItemProps) => (
  <Pressable 
    onPress={onPress} 
    className="flex-row justify-between items-center py-4 active:opacity-70"
  >
    <View className="flex-row items-center">
      <Ionicons
        name={icon}
        size={22}
        color={color || (isDark ? "#ECEFEF" : "black")}
      />
      <Text className={`text-base ml-3 ${isDark ? "text-white" : "text-black"}`}>
        {label}
      </Text>
    </View>
    <View className="flex-row items-center">
      {value && (
        <Text className={`text-sm mr-2 ${isDark ? "text-neutral-400" : "text-gray-500"}`}>
          {value}
        </Text>
      )}
      <Ionicons
        name="chevron-forward"
        size={20}
        color={isDark ? "#ECEFEF" : "black"}
      />
    </View>
  </Pressable>
);

export default SettingsItem;