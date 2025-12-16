import { Text, View, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RecentSearch {
  id: string;
  location: string;
  eventType: string;
  date?: string;
}

const mockRecentSearches: RecentSearch[] = [
  { id: '1', location: 'Gdańsk, Poland', eventType: 'Concerts', date: 'This weekend' },
  { id: '2', location: 'Wrzeszcz', eventType: 'All events' },
  { id: '3', location: 'Sopot', eventType: 'Festivals', date: 'September' },
];

const RecentSearches = () => {
  return (
    <View className="mt-6">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold">Recent Searches</Text>
        <Pressable>
          <Text className="text-blue-600 text-sm">Clear all</Text>
        </Pressable>
      </View>

      {mockRecentSearches.map((search) => (
        <Pressable
          key={search.id}
          className="flex-row items-start py-3 border-b border-gray-200"
        >
          <View className="w-10 h-10 rounded-full bg-blue-100 mr-3 items-center justify-center">
            <Ionicons name="time-outline" size={20} color="#3B82F6" />
          </View>

          <View className="flex-1">
            <Text className="font-medium text-gray-900">{search.location}</Text>
            <Text className="text-gray-600 text-sm">{search.eventType}</Text>
            {search.date && (
              <Text className="text-gray-400 text-sm">{search.date}</Text>
            )}
          </View>

          <Pressable className="p-1">
            <Ionicons name="close-outline" size={20} color="#9CA3AF" />
          </Pressable>
        </Pressable>
      ))}
    </View>
  );
};

export default RecentSearches;
