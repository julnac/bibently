import CommunityTrends from "@/features/search/components/CommunityTrends";
import CompactEventItem from "@/features/search/components/CompactEventItem";
import ContinueExploring from "@/features/search/components/ContinueExploring";
import SeeAllEventsButton from "@/features/search/components/SeeAllEventsButton";
import { useSearch } from "@/features/search/context/SearchContext";
import { useUser } from "@/core/state/user";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { mockEvents } from "../../../src/test/mocks/events.mock";

type ActiveInput = 'none' | 'location' | 'query';

const locationSuggestions = [
  { id: '1', name: 'Wrzeszcz, Poland', icon: 'location' as const },
  { id: '2', name: 'Paris, France', icon: 'location' as const },
  { id: '3', name: 'Gdańsk, Poland', icon: 'location' as const },
  { id: '4', name: 'Berlin, Germany', icon: 'location' as const },
];

export default function Search() {
  const router = useRouter();
  const { addRecentSearch, userSettings } = useUser();
  const { setLocation, location, setQuery, query } = useSearch();
  const [activeInput, setActiveInput] = useState<ActiveInput>('none');
  const locationInputRef = useRef<TextInput>(null);
  const queryInputRef = useRef<TextInput>(null);

  // Filter events based on location and search query
  const filteredEvents = useMemo(() => {
    let results = mockEvents;

    // Filter by location (address or neighborhood)
    if (location.trim()) {
      const locationLower = location.toLowerCase();
        if (locationLower !== "current location"){
            results = results.filter(
                (event) =>
                event.address.toLowerCase().includes(locationLower) ||
                event.neighborhood?.toLowerCase().includes(locationLower)
            );
        };
    }

    // Filter by search query (title, tags, type)
    if (query.trim()) {
      const queryLower = query.toLowerCase();
      results = results.filter(
        (event) =>
          event.title.toLowerCase().includes(queryLower) ||
          event.type.toLowerCase().includes(queryLower)
          // event.tags.some((tag) => tag.toLowerCase().includes(queryLower))
      );
    }

    return results;
  }, [location, query]);

  useEffect(() => {
    queryInputRef.current?.focus();
    setActiveInput('query');
    if (userSettings.defaultCity) {
        setLocation(userSettings.defaultCity)
    };
  }, []);

  const handleMyLocation = () => {
    // In a real app, this would get the user's current location
    setLocation('Current Location');
    setActiveInput('query');
    // Focus query input after location is selected
    setTimeout(() => {
      queryInputRef.current?.focus();
    }, 100);
  };

  const handleLocationSelect = (locationName: string) => {
    setLocation(locationName);
    setActiveInput('query');
    // Focus query input after location is selected
    setTimeout(() => {
      queryInputRef.current?.focus();
    }, 100);
  };

  const handleLocationSubmit = () => {
    if (location.trim() && !query.trim()) {
        queryInputRef.current?.focus();
        setActiveInput('query');
    } else if (location.trim() && query.trim()) {
      // Save to recent searches before navigating
      addRecentSearch(location, query);
      router.push('./index');
    }
  }

  const handleQuerySubmit = () => {
    if (query.trim() && !location.trim()) {
      locationInputRef.current?.focus();
      setActiveInput('location');
    }
    else if (location.trim() && query.trim()) {
      // Save to recent searches before navigating
      addRecentSearch(location, query);
      router.push('./index');
    }
  };

  const showingResults = location.trim() && query.trim();

  return (
    <>
      <View className="flex-1 bg-white">
        {/* Header with Back Button */}
        <View className="px-4 pt-12 pb-3 flex-row items-start gap-2">
          <View className="flex-1">
            {/* Location Search Bar */}
            <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-3">
              <Ionicons name="location-outline" size={20} color="gray" />
              <TextInput
                ref={locationInputRef}
                placeholder="Location (city, neighborhood...)"
                value={location}
                onChangeText={setLocation}
                onFocus={() => setActiveInput('location')}
                onSubmitEditing={handleLocationSubmit}
                className="flex-1 ml-3 text-base"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
              {location.length > 0 && (
                <Pressable onPress={() => setLocation("")}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </Pressable>
              )}
            </View>

            {/* Search Query Bar */}
            <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
              <Ionicons name="search-outline" size={20} color="gray" />
              <TextInput
                ref={queryInputRef}
                placeholder="Search events, categories..."
                value={query}
                onChangeText={setQuery}
                onFocus={() => setActiveInput('query')}
                onSubmitEditing={handleQuerySubmit}
                returnKeyType="search"
                className="flex-1 ml-3 text-base"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </Pressable>
              )}
            </View>
          </View>
          <View className="flex-row items-center mb-4 mt-2">
            <Pressable onPress={() => router.push("./")} className="mr-3">
              <Ionicons name="close" size={24} color="#000" />
            </Pressable>
          </View>
        </View>

        {/* Content Section */}
        <ScrollView className="flex-1 px-4">
          {/* Location Input Active - Show suggestions */}
          {activeInput === 'location' && !showingResults && (
            <>
              {/* My Current Location Button */}
              <Pressable
                onPress={handleMyLocation}
                className="flex-row items-center py-4"
              >
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="navigate" size={20} color="#3B82F6" />
                </View>
                <Text className="text-base font-medium text-gray-900">
                  My current location
                </Text>
              </Pressable>

              {/* Divider */}
              <View className="h-px bg-gray-200 my-2" />

              {/* Location Suggestions */}
              <Text className="text-sm text-gray-500 mb-2 mt-4">
                Suggested locations
              </Text>
              {locationSuggestions.map((suggestion) => (
                <Pressable
                  key={suggestion.id}
                  onPress={() => handleLocationSelect(suggestion.name)}
                  className="flex-row items-center py-3"
                >
                  <Ionicons name="location-outline" size={20} color="#6B7280" />
                  <Text className="text-base text-gray-900 ml-3">
                    {suggestion.name}
                  </Text>
                </Pressable>
              ))}
            </>
          )}

          {/* Query Input Active - Show see all events, recent searches, trends */}
          {activeInput === 'query' && !showingResults && (
            <>
              {/* See All Events Button */}
              <SeeAllEventsButton />

              {/* Divider */}
              <View className="h-px bg-gray-200 my-2" />

              {/* Recent Searches */}
              <ContinueExploring />

              {/* Community Trends */}
              <CommunityTrends />
            </>
          )}

          {/* Showing Results - When typing in query after location is selected */}
          {showingResults && (
            <>
              {filteredEvents.length > 0 ? (
                <>
                  <Text className="text-sm text-gray-500 mb-2">
                    {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
                  </Text>
                  {filteredEvents.map((event) => (
                    <CompactEventItem key={event.id} event={event} />
                  ))}
                  <View className="h-20" />
                </>
              ) : (
                <View className="items-center justify-center py-16">
                  <Ionicons name="sad-outline" size={64} color="#D1D5DB" />
                  <Text className="text-gray-500 text-base mt-4 text-center">
                    No events found
                  </Text>
                  <Text className="text-gray-400 text-sm mt-2 text-center px-8">
                    Try different keywords or location
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </>
  );
}
