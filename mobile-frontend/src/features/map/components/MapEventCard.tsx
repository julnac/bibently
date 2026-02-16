import { EventEntity } from "@/core/types/event.types";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Dimensions, FlatList, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48; // Nieco mniejsza, by było widać krawędź następnej karty
const SPACING = 12;

interface MapEventCardProps {
  events: EventEntity[];
  selectedEventId: string | null;
  onEventChange?: (eventId: string) => void;
}

const MapEventCard = ({ events, selectedEventId, onEventChange }: MapEventCardProps) => {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (selectedEventId) {
      const index = events.findIndex((e) => e.id === selectedEventId);
      if (index !== -1) {
        flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }
    }
  }, [selectedEventId]);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
  
    // Ważne: dzielimy przez CAŁKOWITĄ szerokość "kroku" (karta + margines)
    const index = Math.round(scrollPosition / (CARD_WIDTH + SPACING));
    
    if (index >= 0 && index < events.length) {
      const newId = events[index].id;
      console.log("Karuzela scroll na index:", index, "Nowe ID:", newId);
      // Tylko jeśli ID się faktycznie zmieniło, żeby nie spamować re-renderami
      if (newId !== selectedEventId && onEventChange) {
        onEventChange(newId);
      }
    }
  };

  const renderEventCard = ({ item: event }: { item: EventEntity }) => {
    const formattedDate = format(new Date(event.startDate), "d MMM, HH:mm", { locale: pl });

    return (
      <View style={{ width: CARD_WIDTH, marginLeft: SPACING }}>
        <Pressable
          onPress={() => router.push(`/event/${event.id}`)}
          className="bg-white rounded-2xl shadow-lg flex-row overflow-hidden h-28 active:scale-[0.98] transition-transform"
        >
          {/* Lewa strona: Obrazek */}
          <View className="w-28 h-full bg-gray-100">
            <Image
              source={event.imageUrl ?? undefined}
              contentFit="cover"
              transition={200}
              style={{width: `100%`, height: `100%`}}
              // className="w-full h-full"
              cachePolicy="disk"
              // W expo-image używamy onError, a nie onLoadError
              onError={(e) => console.log("Expo Image Error:", e)}
            />
          </View>

          {/* Prawa strona: Tekst */}
          <View className="flex-1 p-3 justify-between">
            <View>
              <Text className="font-bold text-sm text-gray-900" numberOfLines={2}>
                {event.name}
              </Text>
              <Text className="text-[11px] text-primary font-medium mt-1 uppercase">
                {formattedDate}
              </Text>
            </View>

            <View className="flex-row justify-between items-end">
              <Text className="text-[11px] text-gray-500 flex-1 mr-2" numberOfLines={1}>
                {event.location.name || event.location.address.city}
              </Text>
              <Text className="text-xs font-bold text-gray-900">
                {event.offer.price > 0 ? `${event.offer.price} ${event.offer.currency}` : "FREE"}
              </Text>
            </View>
          </View>
        </Pressable>
      </View>
    );
  };

  if (events.length === 0) return null;

  return (
    <View className="absolute bottom-20 left-0 right-0">
      <FlatList
        ref={flatListRef}
        data={events}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        // Snap settings dla płynnego przeskakiwania
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        contentContainerStyle={{ paddingRight: SPACING }} // Margines na końcu listy
        onMomentumScrollEnd={handleScroll}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH + SPACING,
          offset: (CARD_WIDTH + SPACING) * index,
          index,
        })}
      />
    </View>
  );
};

export default MapEventCard;