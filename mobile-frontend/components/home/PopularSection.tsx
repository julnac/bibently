import { Text, View, Pressable, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Event } from "@/src/types/Event";

interface Props {
  events?: Event[];
}

const PopularSection = ({ events }: Props) => {
  // Mock popular events if none provided
  const popularEvents: Event[] = events || [
    {
      id: '1',
      title: 'Jazz Night at Blue Note',
      date: '25 września',
      startTime: '20:00',
      endTime: '23:00',
      tags: ['Concert', 'Jazz'],
      address: 'ul. Stągiewna 14, Gdańsk',
      going: 289,
      coordinates: { latitude: 54.35234, longitude: 18.66543 },
      type: 'Concert',
      price: 'paid',
      neighborhood: 'Śródmieście',
      climate: 'indoor',
    },
    {
      id: '2',
      title: 'Electronic Music Festival',
      date: '8 października',
      startTime: '18:00',
      endTime: '4:00',
      tags: ['Festival', 'Electronic'],
      address: 'B90, Gdańsk',
      going: 512,
      coordinates: { latitude: 54.36543, longitude: 18.63456 },
      type: 'Festival',
      price: 'paid',
      neighborhood: 'Wrzeszcz',
      climate: 'indoor',
    },
    {
      id: '3',
      title: 'Food Truck Festival',
      date: '28 września',
      startTime: '12:00',
      endTime: '22:00',
      tags: ['Festival', 'Food'],
      address: 'Park Oliwski, Gdańsk',
      going: 734,
      coordinates: { latitude: 54.40786, longitude: 18.56432 },
      type: 'Festival',
      price: 'free',
      neighborhood: 'Oliwa',
      climate: 'outdoor',
    },
  ];

  return (
    <View className="mt-6 mb-8">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold">Popular on Bibently</Text>
        <Pressable>
          <Text className="text-blue-600 text-sm">See all</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {popularEvents.map((event) => (
          <Pressable
            key={event.id}
            className="mr-4 w-64"
          >
            <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Event Image Placeholder */}
              <View className="w-full h-40 bg-gradient-to-br from-purple-400 to-pink-400 items-center justify-center">
                <Ionicons name="image-outline" size={40} color="white" />
              </View>

              {/* Event Details */}
              <View className="p-4">
                <View className="flex-row items-center mb-2">
                  <View className="bg-blue-100 rounded-full px-3 py-1 mr-2">
                    <Text className="text-blue-700 text-xs font-medium">
                      {event.type}
                    </Text>
                  </View>
                  {event.price === 'free' && (
                    <View className="bg-green-100 rounded-full px-3 py-1">
                      <Text className="text-green-700 text-xs font-medium">
                        Free
                      </Text>
                    </View>
                  )}
                </View>

                <Text className="font-semibold text-gray-900 text-base mb-1" numberOfLines={2}>
                  {event.title}
                </Text>

                <View className="flex-row items-center mb-1">
                  <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                  <Text className="text-gray-600 text-sm ml-1">
                    {event.date} • {event.startTime}
                  </Text>
                </View>

                <View className="flex-row items-center mb-3">
                  <Ionicons name="location-outline" size={14} color="#6B7280" />
                  <Text className="text-gray-600 text-sm ml-1" numberOfLines={1}>
                    {event.neighborhood}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                  <View className="flex-row items-center">
                    <Ionicons name="people" size={16} color="#F59E0B" />
                    <Text className="text-gray-700 text-sm ml-1 font-medium">
                      {event.going} going
                    </Text>
                  </View>
                  <Pressable>
                    <Ionicons name="heart-outline" size={22} color="#EF4444" />
                  </Pressable>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default PopularSection;
