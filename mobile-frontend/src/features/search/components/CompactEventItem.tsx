import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Event } from "@/features/events/types";
import { useRouter } from "expo-router";

interface CompactEventItemProps {
  event: Event;
}

const CompactEventItem = ({ event }: CompactEventItemProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/eventEntries/${event.id}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center justify-between py-3 border-b border-gray-100"
    >
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900" numberOfLines={1}>
          {event.title}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {event.date} • {event.startTime}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  );
};

export default CompactEventItem;
