import { Text, View, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";

interface EventType {
  id: string;
  name: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  color: string;
  bgColor: string;
}

const eventTypes: EventType[] = [
  { id: '1', name: 'Concert', icon: 'musical-notes', color: '#EC4899', bgColor: '#FCE7F3' },
  { id: '2', name: 'Sport', icon: 'basketball', color: '#F59E0B', bgColor: '#FEF3C7' },
  { id: '3', name: 'Workshop', icon: 'bulb', color: '#8B5CF6', bgColor: '#EDE9FE' },
  { id: '4', name: 'Party', icon: 'balloon', color: '#EF4444', bgColor: '#FEE2E2' },
  { id: '5', name: 'Festival', icon: 'star', color: '#10B981', bgColor: '#D1FAE5' },
  { id: '6', name: 'Theater', icon: 'film', color: '#6366F1', bgColor: '#E0E7FF' },
];

const EventTypesSection = () => {
  return (
    <View className="mt-6">
      <Text className="text-lg font-semibold mb-4">Browse Events</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {eventTypes.map((type) => (
          <Pressable
            key={type.id}
            className="items-center mr-4 w-20"
          >
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center mb-2"
              style={{ backgroundColor: type.bgColor }}
            >
              <Ionicons name={type.icon} size={28} color={type.color} />
            </View>
            <Text className="text-sm text-gray-700 text-center">{type.name}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default EventTypesSection;
