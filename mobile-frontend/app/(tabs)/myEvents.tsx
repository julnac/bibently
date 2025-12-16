import { Text, View, ScrollView, Pressable} from "react-native";
import LikedSection from "@/components/myEvents/LikedSection";
import UpcomingEvents from "@/components/myEvents/UpcomingEvents";
import Calendar from "@/components/myEvents/Calendar";
import { useTheme } from "@/contexts/ThemeContext";

const myEvents = () => {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";

  return (
    <ScrollView className={`flex-1 px-4 pt-10 ${isDark ? "bg-background-dark" : "bg-white"}`}>
      <Text className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-black"}`}>
        My events
      </Text>

      <Calendar/>

      {/* Tabs */}
      <View className="flex-row mb-4">
        <Pressable className="mr-6">
          <Text className={`text-base font-semibold ${isDark ? "text-white" : "text-black"}`}>
            Upcoming
          </Text>
        </Pressable>
        <Pressable>
          <Text className={`text-base ${isDark ? "text-neutral-400" : "text-gray-500"}`}>
            Liked
          </Text>
        </Pressable>
      </View>

      <UpcomingEvents />
      <LikedSection />
      

      <View className="h-20" />
    </ScrollView>
  );
}

export default myEvents;