import { View, Text, Pressable, TextInput, ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FilterModalProps {
  isVisible: boolean;
  filterType: string;
  options: string[];
  selectedOptions: string[];
  onApply: (selected: string[]) => void;
  onClose: () => void;
}

const filterTitles: { [key: string]: string } = {
  types: 'Type',
  dates: 'Date',
  prices: 'Price',
  distance: 'Distance',
  neighborhoods: 'Neighborhood',
  climate: 'Climate',
};

const FilterModal = ({
  isVisible,
  filterType,
  options,
  selectedOptions,
  onApply,
  onClose,
}: FilterModalProps) => {
  const [selected, setSelected] = useState<string[]>(selectedOptions);
  const [searchQuery, setSearchQuery] = useState('');
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    setSelected(selectedOptions);
  }, [selectedOptions]);

  useEffect(() => {
    if (isVisible) {
      // translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
      translateY.value = withTiming(0.5, { duration: 300 });
      backdropOpacity.value = withTiming(0.5, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [isVisible]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const toggleOption = (option: string) => {
    setSelected((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleApply = () => {
    onApply(selected);
    onClose();
  };

  const handleClear = () => {
    setSelected([]);
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isVisible) return null;

  return (
    <View className="absolute inset-0" style={{ zIndex: 1000 }}>
      <Animated.View
        style={[{ position: 'absolute', inset: 0, backgroundColor: 'black' }, animatedBackdropStyle]}
      >
        <Pressable onPress={onClose} className="flex-1" />
      </Animated.View>

      <Animated.View
        style={[animatedModalStyle, { height: SCREEN_HEIGHT * 0.9 }]}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
          <View className="w-8" />
          <Text className="text-lg font-semibold">{filterTitles[filterType] || filterType}</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </Pressable>
        </View>

        {/* Search */}
        <View className="px-6 py-4">
          <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-base"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Options List */}
        <ScrollView className="flex-1 px-6">
          {filteredOptions.map((option) => (
            <Pressable
              key={option}
              onPress={() => toggleOption(option)}
              className="flex-row items-center justify-between py-4 border-b border-gray-100"
            >
              <Text className="text-base">{option}</Text>
              {selected.includes(option) && (
                <Ionicons name="checkmark" size={24} color="#3C46FF" />
              )}
            </Pressable>
          ))}
        </ScrollView>

        {/* Bottom Actions */}
        <View className="px-6 py-4 border-t border-gray-200">
          <Pressable
            onPress={handleApply}
            className="bg-gray-200 rounded-xl py-4 mb-3"
          >
            <Text className="text-center font-semibold text-base">
              See {selected.length} result{selected.length !== 1 ? 's' : ''}
            </Text>
          </Pressable>
          <Pressable onPress={handleClear}>
            <Text className="text-center font-semibold text-base underline">
              CLEAR
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
};

export default FilterModal;
