import { View, Text, Pressable, Dimensions } from "react-native";
import { useEffect, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

interface PriceFilterModalProps {
  isVisible: boolean;
  onApply: (minPrice: number, maxPrice: number) => void;
  onClose: () => void;
  initialMin?: number;
  initialMax?: number;
}

const PriceFilterModal = ({
  isVisible,
  onApply,
  onClose,
  initialMin = 0,
  initialMax = 600,
}: PriceFilterModalProps) => {
  const MIN_PRICE = 0;
  const MAX_PRICE = 1000;
  const SLIDER_WIDTH = SCREEN_WIDTH - 48; // Account for padding
  const THUMB_SIZE = 20;

  const [minPrice, setMinPrice] = useState(initialMin);
  const [maxPrice, setMaxPrice] = useState(initialMax);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const minThumbX = useSharedValue((minPrice / MAX_PRICE) * SLIDER_WIDTH);
  const maxThumbX = useSharedValue((maxPrice / MAX_PRICE) * SLIDER_WIDTH);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(0.5, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
      backdropOpacity.value = withTiming(0, { duration: 250 });
    }
  }, [isVisible]);

  useEffect(() => {
    minThumbX.value = (minPrice / MAX_PRICE) * SLIDER_WIDTH;
    maxThumbX.value = (maxPrice / MAX_PRICE) * SLIDER_WIDTH;
  }, [minPrice, maxPrice]);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const updateMinPrice = (x: number) => {
    const percentage = Math.max(0, Math.min(1, x / SLIDER_WIDTH));
    const newMin = Math.round(percentage * MAX_PRICE);
    setMinPrice(Math.min(newMin, maxPrice));
  };

  const updateMaxPrice = (x: number) => {
    const percentage = Math.max(0, Math.min(1, x / SLIDER_WIDTH));
    const newMax = Math.round(percentage * MAX_PRICE);
    setMaxPrice(Math.max(newMax, minPrice));
  };

  const startMinX = useSharedValue(0);
  const startMaxX = useSharedValue(0);

  const minGesture = Gesture.Pan()
    .onBegin(() => {
      startMinX.value = minThumbX.value;
    })
    .onUpdate((event) => {
      const newX = Math.max(0, Math.min(maxThumbX.value, startMinX.value + event.translationX));
      minThumbX.value = newX;
    })
    .onEnd(() => {
      runOnJS(updateMinPrice)(minThumbX.value);
    });

  const maxGesture = Gesture.Pan()
    .onBegin(() => {
      startMaxX.value = maxThumbX.value;
    })
    .onUpdate((event) => {
      const newX = Math.max(minThumbX.value, Math.min(SLIDER_WIDTH, startMaxX.value + event.translationX));
      maxThumbX.value = newX;
    })
    .onEnd(() => {
      runOnJS(updateMaxPrice)(maxThumbX.value);
    });

  const animatedMinThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: minThumbX.value }],
  }));

  const animatedMaxThumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: maxThumbX.value }],
  }));

  const animatedTrackStyle = useAnimatedStyle(() => ({
    left: minThumbX.value,
    width: maxThumbX.value - minThumbX.value,
  }));

  const handleApply = () => {
    onApply(minPrice, maxPrice);
    onClose();
  };

  const handleClear = () => {
    setMinPrice(MIN_PRICE);
    setMaxPrice(MAX_PRICE);
  };

  if (!isVisible) return null;

  return (
    <View className="absolute inset-0" style={{ zIndex: 1000 }}>
      <Animated.View
        style={[
          { position: "absolute", inset: 0, backgroundColor: "black" },
          animatedBackdropStyle,
        ]}
      >
        <Pressable onPress={onClose} className="flex-1" />
      </Animated.View>

      <Animated.View
        style={[animatedModalStyle]}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl pb-8"
      >
        {/* Drag Handle */}
        <View className="items-center py-3">
          <View className="w-12 h-1 bg-gray-300 rounded-full" />
        </View>

        {/* Header */}
        <View className="px-6 py-3 border-b border-gray-200">
          <Text className="text-lg font-semibold text-center">Price</Text>
        </View>

        {/* Price Range Display */}
        <View className="px-6 pt-8 pb-4">
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-base font-medium">{minPrice}zł</Text>
            <Text className="text-base font-medium">{maxPrice}zł</Text>
          </View>

          {/* Slider Container */}
          <View className="h-12 justify-center">
            {/* Background Track */}
            <View
              className="absolute h-1 bg-gray-200 rounded-full"
              style={{ width: SLIDER_WIDTH }}
            />

            {/* Active Track */}
            <Animated.View
              className="absolute h-1 bg-black rounded-full"
              style={[animatedTrackStyle, { height: 4 }]}
            />

            {/* Min Thumb */}
            <GestureDetector gesture={minGesture}>
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    width: THUMB_SIZE,
                    height: THUMB_SIZE,
                    borderRadius: THUMB_SIZE / 2,
                    backgroundColor: "#000",
                    top: -8,
                  },
                  animatedMinThumbStyle,
                ]}
              />
            </GestureDetector>

            {/* Max Thumb */}
            <GestureDetector gesture={maxGesture}>
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    width: THUMB_SIZE,
                    height: THUMB_SIZE,
                    borderRadius: THUMB_SIZE / 2,
                    backgroundColor: "#000",
                    top: -8,
                  },
                  animatedMaxThumbStyle,
                ]}
              />
            </GestureDetector>
          </View>

          {/* Min/Max Labels */}
          <View className="flex-row justify-between mt-2">
            <Text className="text-sm text-gray-500">{MIN_PRICE}zł</Text>
            <Text className="text-sm text-gray-500">{MAX_PRICE}zł</Text>
          </View>
        </View>

        {/* Bottom Actions */}
        <View className="px-6 pt-8">
          <Pressable
            onPress={handleApply}
            className="bg-gray-200 rounded-full py-4 mb-3"
          >
            <Text className="text-center font-semibold text-base">
              See 4 results
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

export default PriceFilterModal;
