import { Text, Pressable, View } from "react-native";

interface FilterChipProps {
  label: string;
  isActive: boolean;
  count?: number;
  onPress: () => void;
}

const FilterChip = ({ label, isActive, count, onPress }: FilterChipProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center px-4 py-2 rounded-full border mr-2 ${
        isActive
          ? 'bg-accent border-accent'
          : 'bg-white border-gray-300'
      }`}
    >
      <Text className={`text-sm ${isActive ? 'text-white font-medium' : 'text-gray-700'}`}>
        {label}
      </Text>
      {count !== undefined && count > 0 && (
        <View className="ml-2 bg-white rounded-full w-5 h-5 items-center justify-center">
          <Text className="text-xs text-accent font-semibold">{count}</Text>
        </View>
      )}
    </Pressable>
  );
};

export default FilterChip;
