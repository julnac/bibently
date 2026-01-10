import { View, Text, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface DateFilterModalProps {
  isVisible: boolean;
  onApply: (selectedDates: Date[]) => void;
  onClose: () => void;
}

const DateFilterModal = ({
  isVisible,
  onApply,
  onClose,
}: DateFilterModalProps) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectionMode, setSelectionMode] = useState<"single" | "range">(
    "single"
  );
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      translateY.value = withTiming(0, { duration: 300 });
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

  const quickFilters = [
    { label: "Today", value: "today" },
    { label: "Tomorrow", value: "tomorrow" },
    { label: "Weekend", value: "weekend" },
    { label: "This week", value: "week" },
  ];

  const handleQuickFilter = (value: string) => {
    const today = new Date();
    const dates: Date[] = [];

    switch (value) {
      case "today":
        dates.push(today);
        break;
      case "tomorrow":
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        dates.push(tomorrow);
        break;
      case "weekend":
        const saturday = new Date(today);
        const sunday = new Date(today);
        const dayOfWeek = today.getDay();
        const daysUntilSaturday = dayOfWeek === 0 ? 6 : 6 - dayOfWeek;
        saturday.setDate(today.getDate() + daysUntilSaturday);
        sunday.setDate(today.getDate() + daysUntilSaturday + 1);
        dates.push(saturday, sunday);
        break;
      case "week":
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
        for (let d = new Date(today); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
          dates.push(new Date(d));
        }
        break;
    }

    setSelectedDates(dates);
    setSelectionMode("range");
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const handleDatePress = (day: number) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );

    if (selectionMode === "single") {
      setSelectedDates([selectedDate]);
    } else {
      // Range selection
      if (selectedDates.length === 0 || selectedDates.length === 2) {
        setSelectedDates([selectedDate]);
      } else if (selectedDates.length === 1) {
        const firstDate = selectedDates[0];
        if (selectedDate < firstDate) {
          setSelectedDates([selectedDate, firstDate]);
        } else {
          setSelectedDates([firstDate, selectedDate]);
        }
      }
    }
  };

  const isDateSelected = (day: number) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return selectedDates.some(
      (selectedDate) =>
        selectedDate.getDate() === date.getDate() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getFullYear() === date.getFullYear()
    );
  };

  const isDateInRange = (day: number) => {
    if (selectedDates.length !== 2) return false;

    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    const [start, end] = selectedDates;
    return date >= start && date <= end;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const handleApply = () => {
    onApply(selectedDates);
    onClose();
  };

  const handleClear = () => {
    setSelectedDates([]);
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const weeks = [];
    let week = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      week.push(<View key={`empty-${i}`} className="flex-1 aspect-square" />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = isDateSelected(day);
      const isInRange = isDateInRange(day);

      week.push(
        <Pressable
          key={day}
          onPress={() => handleDatePress(day)}
          className={`flex-1 aspect-square items-center justify-center ${
            isSelected || isInRange ? "bg-gray-200" : ""
          } ${isSelected ? "bg-black" : ""}`}
        >
          <Text
            className={`text-base ${
              isSelected ? "text-white font-semibold" : "text-black"
            }`}
          >
            {day}
          </Text>
        </Pressable>
      );

      if (week.length === 7) {
        weeks.push(
          <View key={`week-${weeks.length}`} className="flex-row">
            {week}
          </View>
        );
        week = [];
      }
    }

    // Add remaining empty cells
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(
          <View
            key={`empty-end-${week.length}`}
            className="flex-1 aspect-square"
          />
        );
      }
      weeks.push(
        <View key={`week-${weeks.length}`} className="flex-row">
          {week}
        </View>
      );
    }

    return weeks;
  };

  if (!isVisible) return null;

  const monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];

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
        style={[animatedModalStyle, { height: SCREEN_HEIGHT * 0.9 }]}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl"
      >
        {/* Drag Handle */}
        <View className="items-center py-3">
          <View className="w-12 h-1 bg-gray-300 rounded-full" />
        </View>

        {/* Header */}
        <View className="px-6 py-3 border-b border-gray-200">
          <Text className="text-lg font-semibold text-center">Date</Text>
        </View>

        {/* Quick Filters */}
        <View className="flex-row px-6 py-4 gap-2">
          {quickFilters.map((filter) => (
            <Pressable
              key={filter.value}
              onPress={() => handleQuickFilter(filter.value)}
              className="bg-gray-200 px-4 py-2 rounded-full"
            >
              <Text className="text-sm font-medium">{filter.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Month Navigation */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <Pressable onPress={() => navigateMonth("prev")}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </Pressable>
          <Text className="text-base font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <Pressable onPress={() => navigateMonth("next")}>
            <Ionicons name="chevron-forward" size={24} color="#000" />
          </Pressable>
        </View>

        {/* Calendar */}
        <View className="px-6">
          {/* Week Days Header */}
          <View className="flex-row mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
              <View key={index} className="flex-1 items-center">
                <Text className="text-sm font-medium text-gray-500">{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          {renderCalendar()}
        </View>

        {/* Helper Text */}
        <Text className="text-center text-sm text-gray-400 mt-4">
          choose day or range
        </Text>

        {/* Bottom Actions */}
        <View className="px-6 py-4 mt-auto">
          <Pressable
            onPress={handleApply}
            className="bg-gray-200 rounded-full py-4 mb-3"
          >
            <Text className="text-center font-semibold text-base">
              See {selectedDates.length} result{selectedDates.length !== 1 ? "s" : ""}
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

export default DateFilterModal;
