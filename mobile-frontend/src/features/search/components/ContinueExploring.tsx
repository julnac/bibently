import { Text, View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@/core/state/user";
import { useSearch } from "@/features/search/context/SearchContext";
import { useRouter, Href } from "expo-router";

const ContinueExploring = () => {
  const { recentSearches, clearRecentSearches, removeRecentSearch } = useUser();
  const { setLocation, setQuery } = useSearch();
  const router = useRouter();

  if (recentSearches.length === 0) {
    return null;
  }

  const handleSearchPress = (location: string, query: string) => {
    // Ustaw wartości w SearchContext przed nawigacją
    setLocation(location);
    setQuery(query);
    // Nawiguj do zakładki mapy
    router.push('./');
  };

  return (
    <View className="mt-6">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold">Continue exploring</Text>
        <Pressable onPress={clearRecentSearches}>
          <Text className="text-gray-500">Clear all</Text>
        </Pressable>
      </View>

      {recentSearches.map((search) => (
        <View key={search.id} className="flex-row items-start py-3 border-b border-gray-200">
          <Pressable
            onPress={() => handleSearchPress(search.location, search.query)}
            className="flex-1 flex-row items-start"
          >
            <View className="w-10 h-10 rounded-lg bg-blue-100 items-center justify-center mr-3">
              <Ionicons name="search-outline" size={20} color="#3B82F6" />
            </View>

            <View className="flex-1">
              <Text className="font-medium">{search.location}</Text>
              <Text className="text-gray-500 text-sm">{search.query}</Text>
              <Text className="text-gray-400 text-sm">
                {new Date(search.timestamp).toLocaleDateString()}
              </Text>
            </View>
          </Pressable>

          <Pressable onPress={() => removeRecentSearch(search.id)}>
            <Ionicons name="close-outline" size={24} color="gray" />
          </Pressable>
        </View>
      ))}
    </View>
  );
};

export default ContinueExploring;