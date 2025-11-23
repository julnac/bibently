import { Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

const Calendar = () => {
    const [selectedDate, setSelectedDate] = useState<number | null>(17);
    
    return (
        <View className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-200">
        <View className="flex-row justify-between items-center mb-2">
          <Pressable>
            <Ionicons name="chevron-back" size={20} />
          </Pressable>
          <Text className="font-semibold">NOV 2025</Text>
          <Pressable>
            <Ionicons name="chevron-forward" size={20} />
          </Pressable>
        </View>

        {/* Weekdays */}
        <View className="flex-row justify-between mb-2">
          {["M", "Tu", "W", "Th", "F", "Sa", "Su"].map((d) => (
            <Text key={d} className="text-gray-500 text-xs w-6 text-center">
              {d}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View className="flex-row flex-wrap justify-between">
          {[...Array(30)].map((_, i) => {
            const day = i + 1;
            const isSelected = selectedDate === day;

            return (
              <Pressable
                key={day}
                onPress={() => setSelectedDate(day)}
                className="w-10 h-10 items-center justify-center my-1"
              >
                <View
                  className={`w-8 h-8 rounded-full ${
                    isSelected ? "bg-black" : "bg-gray-300"
                  }`}
                />
              </Pressable>
            );
          })}
        </View>
      </View>
    );
}
export default Calendar;