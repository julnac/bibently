import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Event } from "@/features/events/types";
import { useRouter } from "expo-router";

interface ListEventCardProps {
  event: Event;
  onBookmark: (eventId: string) => void;
  isBookmarked: boolean;
}

const ListEventCard = ({
  event,
  onBookmark,
  isBookmarked,
}: ListEventCardProps) => {
  const router = useRouter();

  const handleCardPress = () => {
    router.push({
      pathname: `/map/event/[id]`,
      params: { id: event.id },
    });
  };

  return (
    <Pressable
      onPress={handleCardPress}
      className="bg-white rounded-xl mb-4 overflow-hidden shadow-sm"
    >
      {/* Event Image Placeholder */}
      <View className="h-48 bg-gray-200 relative">
        {/* Tags on Image */}
        <View className="absolute top-3 left-3 flex-row flex-wrap">
          {event.tags.slice(0, 3).map((tag) => (
            <View
              key={tag}
              className="bg-gray-100 px-2 py-1 rounded-lg mr-2 mb-1"
            >
              <Text className="text-xs text-gray-600">{tag}</Text>
            </View>
          ))}
        </View>

        {/* Action Icons */}
        <View className="absolute top-3 right-3 flex-row">
          <Pressable
            onPress={() => onBookmark(event.id)}
            className="bg-white rounded-full p-2 mr-2"
          >
            <Ionicons
              name={isBookmarked ? "heart" : "heart-outline"}
              size={20}
              color="#DC5B40"
            />
          </Pressable>
        </View>
      </View>

      {/* Event Details */}
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-2">
            <Text className="font-semibold text-base mb-1">{event.title}</Text>
            <Text className="text-sm text-gray-500">
              {event.date}, {event.startTime}-{event.endTime}
            </Text>
          </View>
          <Text className="text-sm text-gray-600 font-medium">
            {event.going} going
          </Text>
        </View>

        <Text className="text-sm text-gray-500 mb-3">
          {event.address}
        </Text>

        {event.price && (
          <Text className="text-xs text-gray-400">
            od {event.price === 'free' ? '0' : '60'} zł
          </Text>
        )}
      </View>
    </Pressable>
  );
};

export default ListEventCard;
