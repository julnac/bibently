import { ChooseCityModal, EventTypesSection, PopularSection } from "@/features/home";
import { availableCities } from "@/features/home/constants/cities";
import { useSearch } from "@/features/search/context/SearchContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import SearchBar from "../../components/search/SearchBar";
import { useUser } from "@/core/state/user";
import { useTheme } from "@/core/state/theme";
import '../global.css';

export default function Index() {
  const router = useRouter();
  const { userSettings, updateUserSettings } = useUser();
  const { setLocation } = useSearch();
  const { actualTheme } = useTheme();
  const isDark = actualTheme === "dark";
  const [cityModalVisible, setCityModalVisible] = useState(false);

  function handleSearchPress() {
    router.push('/map/SearchScreen');
  }

  function handleMapRedirect() {
    router.push('/map/MapScreen');
  }

  function openCityModal() {
    setCityModalVisible(true);
  }

  function handleCitySelect(city: string) {
    updateUserSettings({ defaultCity: city });
    setLocation(city)
  }

  return (
    <View className={`flex-1 ${isDark ? "bg-background-dark" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >

        {/* Location */}
        <Pressable
          className="px-4 pt-12 pb-3 flex-row gap-4"
          onPress={openCityModal}
        >
          <Text className={`mt-1 ${isDark ? "text-neutral-300" : "text-gray-700"}`}>
            {userSettings.defaultCity ? userSettings.defaultCity : "Choose city"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={isDark ? "#D9DEE6" : "gray"}
          />
        </Pressable>

        {/* Search Bar */}
        <View className="pt-3 px-4 mb-4">
          <SearchBar
            placeholder="Search for events, places..."
            onPress={handleSearchPress}
            iconName="search"
            editable={false}
          />
        </View>

        <Pressable
          onPress={handleMapRedirect}
          className={`mx-4 flex-row items-center justify-between gap-2 rounded-xl px-5 py-3 shadow-lg ${
            isDark ? "bg-neutral-600 active:bg-neutral-500" : "bg-neutral-700 active:bg-zinc-900"
          }`}
        >
          <View className="flex-row gap-4 items-center">
            <Ionicons name="map-outline" size={18} color="#D9DEE6" />
            <Text className="text-base font-semibold text-neutral-200">
              Explore nearby events
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#D9DEE6" />
        </Pressable>

        {/* Event Types */}
        <View className="px-4">
          <EventTypesSection />
        </View>

        {/* Popular on Bibently */}
        <View className="px-4">
          <PopularSection />
        </View>
      </ScrollView>

      {/* Choose City Modal */}
      <ChooseCityModal
        isVisible={cityModalVisible}
        cities={availableCities}
        selectedCity={userSettings.defaultCity || ''}
        onSelectCity={handleCitySelect}
        onClose={() => setCityModalVisible(false)}
      />
    </View>
  );
}
