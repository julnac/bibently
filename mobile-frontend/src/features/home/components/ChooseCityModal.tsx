import { View, Text, Pressable, TextInput, ScrollView, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ChooseCityModalProps {
  isVisible: boolean;
  cities: string[];
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onClose: () => void;
}

const ChooseCityModal = ({
  isVisible,
  cities,
  selectedCity,
  onSelectCity,
  onClose,
}: ChooseCityModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 90 });
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

  const handleSelectCity = (city: string) => {
    onSelectCity(city);
    onClose();
  };

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase())
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
        style={[animatedModalStyle, { height: SCREEN_HEIGHT * 0.7 }]}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
          <View className="w-8" />
          <Text className="text-lg font-semibold">Choose City</Text>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color="#000" />
          </Pressable>
        </View>

        {/* Search */}
        <View className="px-6 py-4">
          <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Search cities..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2 text-base"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* My Location Option */}
        <View className="px-6">
          <Pressable
            onPress={() => handleSelectCity('Current Location')}
            className="flex-row items-center py-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Ionicons name="navigate" size={20} color="#3B82F6" />
            </View>
            <Text className="text-base font-medium">Use my current location</Text>
            {selectedCity === 'Current Location' && (
              <Ionicons name="checkmark" size={24} color="#3C46FF" className="ml-auto" />
            )}
          </Pressable>
        </View>

        {/* Cities List */}
        <ScrollView className="flex-1 px-6">
          {filteredCities.map((city) => (
            <Pressable
              key={city}
              onPress={() => handleSelectCity(city)}
              className="flex-row items-center justify-between py-4 border-b border-gray-100"
            >
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={20} color="#6B7280" className="mr-3" />
                <Text className="text-base">{city}</Text>
              </View>
              {selectedCity === city && (
                <Ionicons name="checkmark" size={24} color="#3C46FF" />
              )}
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default ChooseCityModal;
