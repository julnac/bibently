import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View, Alert, ActivityIndicator } from "react-native";
import { useFilterStore } from "@/src/core/store/useFilterStore";
import { useUserLocation } from "@/src/core/store/useLocation";

type ActiveInput = 'none' | 'location' | 'query';

const locationSuggestions = [
  { id: '1', name: 'Gdańsk', icon: 'location' as const },
  { id: '2', name: 'Gdynia', icon: 'location' as const },
  { id: '3', name: 'Sopot', icon: 'location' as const }
];

export default function Search() {
  const router = useRouter();
  const { setFilters, filters, setGPSLocation, resetLocalizationFilters, setCity } = useFilterStore();
  const { location, status, requestLocation } = useUserLocation()
  const [isLocating, setIsLocating] = useState(false);

  const [localLocation, setLocalLocation] = useState(filters.City || "");
  const [localQuery, setLocalQuery] = useState(filters.Name || "");
  const [activeInput, setActiveInput] = useState<ActiveInput>('none');

  const locationInputRef = useRef<TextInput>(null);
  const queryInputRef = useRef<TextInput>(null);

  const formatKeywords = (text: string): string[] | undefined => {
    if (!text.trim()) return undefined;
    return text.toLowerCase().trim().split(/\s+/);
  };

  const commitSearch = () => {
    if (localLocation === "Moja lokalizacja" && location?.latitude && location?.longitude){
      setGPSLocation(location.latitude, location.longitude);
    } else {
      resetLocalizationFilters();
      setCity(localLocation)
    }
    setFilters({
      Keywords: formatKeywords(localQuery),
      Name: localQuery.trim() || undefined,
      PageToken: undefined
    });
    router.replace('/map'); 
  };

  const focusInput = (type: ActiveInput) => {
    setActiveInput(type);
    const ref = type === 'location' ? locationInputRef : queryInputRef;
    setTimeout(() => ref.current?.focus(), 50);
  };

  const handleLocationSelect = (locationName: string) => {
    setLocalLocation(locationName);
    if (!localQuery.trim()) {
      focusInput('query');
    } else {
      commitSearch();
    }
  };

  const handleLocationSubmit = () => {
    if (localLocation.trim()) {
      if (localQuery.trim()) {
        commitSearch();
      } else {
        focusInput('query');
      }
    }
  };

  const handleQuerySubmit = () => {
    if (localQuery.trim()) {
      if (localLocation.trim()) {
        commitSearch();
      } else {
        focusInput('location');
      }
    }
  };

  const showingResults = localLocation.trim() && localQuery.trim();

  const handleCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const coords = await requestLocation();
      if (coords) {
        handleLocationSelect("Moja lokalizacja");
      } else {
        // Obsługa przypadku, gdy status !== 'granted'
        Alert.alert(
          "Brak dostępu",
          "Aby wyszukać wydarzenia w Twojej okolicy, musisz zezwolić na dostęp do lokalizacji w ustawieniach telefonu.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      Alert.alert("Błąd", "Nie udało się pobrać lokalizacji.");
    } finally {
      setIsLocating(false);
    }
  };

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
                value={localLocation}
                onChangeText={setLocalLocation}
                onFocus={() => setActiveInput('location')}
                onSubmitEditing={handleLocationSubmit}
                className="flex-1 ml-3 text-base"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
              {localLocation.length > 0 && (
                <Pressable onPress={() => setLocalLocation("")}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </Pressable>
              )}
            </View>

            {/* Query Search Bar */}
            <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
              <Ionicons name="search-outline" size={20} color="gray" />
              <TextInput
                ref={queryInputRef}
                placeholder="Search events, categories..."
                value={localQuery}
                onChangeText={setLocalQuery}
                onFocus={() => setActiveInput('query')}
                onSubmitEditing={handleQuerySubmit}
                returnKeyType="search"
                className="flex-1 ml-3 text-base"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
              {localQuery.length > 0 && (
                <Pressable onPress={() => setLocalQuery("")}>
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
                onPress={handleCurrentLocation}
                disabled={isLocating}
                className="flex-row items-center py-4"
              >
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  {isLocating ? (
                    <ActivityIndicator size="small" color="#3B82F6" />
                  ) : (
                    <Ionicons name="navigate" size={20} color="#3B82F6" />
                  )}
                </View>
                <Text className="text-base font-medium text-gray-900">
                  {isLocating ? "Pobieranie lokalizacji..." : "Moja lokalizacja"}
                </Text>
                {status === 'denied' && (
                  <Text className="text-xs text-red-500">Brak uprawnień (kliknij, by spróbować ponownie)</Text>
                )}
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

          {activeInput === 'query' && !showingResults && (
            <>
              <Pressable 
                  className="flex-row items-center justify-between py-4"
                  onPress={commitSearch}
              >
                  <View className="flex-row items-center gap-2">
                    <View className="w-10 h-10 rounded-lg bg-indigo-100 items-center justify-center mr-3">
                      <Ionicons name="megaphone-outline" size={20} color="#3C46FF" />
                    </View>
                    <Text className="text-primary font-bold">Wszystkie wydarzenia</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="black" />
              </Pressable>
              <View className="h-px bg-gray-200 my-2" />
            </>
          )}

        </ScrollView>
      </View>
    </>
  );
}
