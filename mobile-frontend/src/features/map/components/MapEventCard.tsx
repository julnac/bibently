import { Event } from "@/features/events/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Dimensions, FlatList, Pressable, Text, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32; // 16px padding on each side

interface MapEventCardProps {
  events: Event[];
  selectedEventId: string | null;
  onBookmark: (eventId: string) => void;
  bookmarkedEvents: Set<string>;
  onEventChange?: (eventId: string) => void;
}

const MapEventCard = ({
  events,
  selectedEventId,
  onBookmark,
  bookmarkedEvents,
  onEventChange,
}: MapEventCardProps) => {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  // Scroll to selected event when it changes
  useEffect(() => {
    if (selectedEventId) {
      const index = events.findIndex((e) => e.id === selectedEventId);
      if (index !== -1 && flatListRef.current) {
        flatListRef.current.scrollToIndex({ index, animated: true });
      }
    }
  }, [selectedEventId, events]);

  const handleEventPress = (eventId: string) => {
    router.push({
      pathname: `/map/event/[id]`,
      params: { id: eventId },
    });
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    if (index >= 0 && index < events.length && onEventChange) {
      onEventChange(events[index].id);
    }
  };

  if (events.length === 0) return null;

  const renderEventCard = ({ item: event }: { item: Event }) => {
    const isBookmarked = bookmarkedEvents.has(event.id);

    return (
      <View style={{ width: CARD_WIDTH, paddingHorizontal: 16 }}>
        <Pressable
          onPress={() => handleEventPress(event.id)}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          {/* Event Details - Compact Layout */}
          <View className="px-4 py-3">
            {/* Title and Bookmark */}
            <View className="flex-row justify-between items-start mb-1">
              <Text className="font-semibold text-base flex-1 mr-2">
                {event.title}
              </Text>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onBookmark(event.id);
                }}
                className="w-7 h-7 rounded-full bg-black items-center justify-center"
              >
                <Ionicons
                  name="add"
                  size={20}
                  color="white"
                />
              </Pressable>
            </View>

            {/* Date and Time */}
            <Text className="text-xs text-gray-500 mb-2">
              {event.date}, {event.startTime}-{event.endTime}
            </Text>

            {/* Tags */}
            <View className="flex-row flex-wrap mb-2">
              {event.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={`${tag}-${index}`}
                  className="bg-gray-100 px-2 py-1 rounded-md mr-2 mb-1"
                >
                  <Text className="text-xs text-gray-700">{tag}</Text>
                </View>
              ))}
            </View>

            {/* Address */}
            <Text className="text-xs text-gray-500">
              {event.address}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <View className="absolute bottom-20 left-0 right-0">
      <FlatList
        ref={flatListRef}
        data={events}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScroll}
        getItemLayout={(data, index) => ({
          length: CARD_WIDTH,
          offset: CARD_WIDTH * index,
          index,
        })}
      />
    </View>
  );
};

export default MapEventCard;
