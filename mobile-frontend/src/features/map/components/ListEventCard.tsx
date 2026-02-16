import { View, Text, Pressable } from "react-native";
import { EventEntity } from "@/core/types/event.types";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Image } from "expo-image";

interface ListEventCardProps {
  event: EventEntity;
}

const ListEventCard = ({ event }: ListEventCardProps) => {
  const router = useRouter();

  // Formatowanie daty: np. "16 lutego, 18:59"
  const formattedDate = format(new Date(event.startDate), "d MMMM, HH:mm", { locale: pl });
  const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x300.png?text=Bibently+Event";

  const handleCardPress = () => {
    router.push({
      pathname: `/event/[id]`,
      params: { id: event.id },
    });
  };

  return (
    <Pressable
      onPress={handleCardPress}
      className="bg-white rounded-xl mb-4 overflow-hidden shadow-sm active:opacity-90"
    >
      {/* Event Image */}
      <View className="h-40 bg-gray-200 relative">
        <Image 
          source={{ uri: event.imageUrl || PLACEHOLDER_IMAGE }}
          // placeholder={blurhash}
          // className="w-full h-full"
          style={{ width: `100%`, height: `100%`}}
          contentFit="cover"
          transition={1000}
        />
        {/* Odkomentowane i poprawione Tagi (Keywords) */}
        <View className="absolute top-3 left-3 flex-row flex-wrap">
          {event.keywords?.slice(0, 2).map((tag) => (
            <View key={tag} className="bg-black/50 px-2 py-1 rounded-md mr-2">
              <Text className="text-[10px] font-bold text-white uppercase">{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Event Details */}
      <View className="p-4">
        <Text className="font-bold text-lg text-gray-900 mb-1" numberOfLines={1}>
          {event.name}
        </Text>
        
        <Text className="text-sm text-primary font-medium mb-2">
          {formattedDate}
        </Text>

        <View className="flex-row items-center mb-3">
          {/* Tu możesz dodać ikonkę pinezki */}
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {event.location.name} • {event.location.address.city}
          </Text>
        </View>

        <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
          <Text className="font-semibold text-gray-900">
            {event.offer.price > 0 ? `${event.offer.price} ${event.offer.currency}` : "Bezpłatne"}
          </Text>
          {event.attendanceMode === "OnlineEventAttendanceMode" && (
            <View className="bg-blue-100 px-2 py-1 rounded">
              <Text className="text-[10px] text-blue-700 font-bold">ONLINE</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default ListEventCard;