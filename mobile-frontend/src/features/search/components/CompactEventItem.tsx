import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { EventEntity } from "@/core/types/event.types";
import { useRouter } from "expo-router";
import { extractTime } from "../../events/adapters/eventAdapter";

interface CompactEventItemProps {
  event: EventEntity;
}

const CompactEventItem = ({ event }: CompactEventItemProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: `/event/[id]`,
      params: { id: event.id },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center justify-between py-3 border-b border-gray-100"
    >
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900" numberOfLines={1}>
          {event.name}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {extractTime(event.startDate)} • {extractTime(event.endDate? event.endDate : event.startDate)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  );
};

export default CompactEventItem;
