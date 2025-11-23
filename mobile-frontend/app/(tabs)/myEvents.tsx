import { Text, View, ScrollView, Pressable} from "react-native";
import LikedSection from "@/components/myEvents/LikedSection";
import UpcomingEvents from "@/components/myEvents/UpcomingEvents";
import Calendar from "@/components/myEvents/Calendar";

const myEvents = () => {

  return (
    <ScrollView className="flex-1 bg-white px-4 pt-10">
      <Text className="text-xl font-semibold mb-4">My events</Text>

      <Calendar/>

      {/* Tabs */}
      <View className="flex-row mb-4">
        <Pressable className="mr-6">
          <Text className="text-base font-semibold">Upcoming</Text>
        </Pressable>
        <Pressable>
          <Text className="text-base text-gray-500">Liked</Text>
        </Pressable>
      </View>

      <UpcomingEvents />
      <LikedSection />
      

      <View className="h-20" />
    </ScrollView>
  );
}

export default myEvents;