import { useSearch } from '@/features/search/context/SearchContext';
import { useTheme } from '@/core/state/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from '@rneui/themed';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { darkMapStyle, lightMapStyle } from '@/features/map/config/map-styles';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomMarker from '../../../src/features/map/components/CustomMarker';
import FilterBar from '../../../src/features/map/components/filters/FilterBar';
import FilterModal from '../../../src/features/map/components/filters/FilterModal';
import DateFilterModal from '../../../src/features/map/components/filters/DateFilterModal';
import PriceFilterModal from '../../../src/features/map/components/filters/PriceFilterModal';
import ListEventCard from '../../../src/features/map/components/ListEventCard';
import MapEventCard from '../../../src/features/map/components/MapEventCard';
import SearchHereButton from '../../../src/features/map/components/SearchHereButton';
import SearchBar from '../../../src/features/search/components/SearchBar';
import { eventsService } from '@/features/events/services/events.service';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const filterOptions = {
  types: ['Concert', 'Sport', 'Workshop', 'Party', 'Festival', 'Theater'],
  dates: ['Today', 'Tomorrow', 'This Week', 'This Month'],
  prices: ['Free', 'Paid'],
  distance: ['1 km', '5 km', '10 km', '25 km'],
  neighborhoods: ['Wrzeszcz', 'Śródmieście', 'Oliwa', 'Zaspa', 'Brzeźno', 'Jelitkowo', 'Stogi'],
  climate: ['Indoor', 'Outdoor'],
};

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { actualTheme } = useTheme();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Set<string>>(new Set());
  const [activeFilterModal, setActiveFilterModal] = useState<string | null>(null);
  const { location, query } = useSearch();

  // API state management
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    types: [] as string[],
    dates: [] as string[],
    prices: [] as string[],
    priceRange: { min: 0, max: 1000 } as { min: number; max: number },
    distance: null as string | null,
    neighborhoods: [] as string[],
    climate: [] as string[],
  });

  const listTranslateY = useSharedValue(SCREEN_HEIGHT);

  // Fetch events from API
  useEffect(() => {
    async function fetchEvents() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await eventsService.getAll({
          city: location || 'Gdańsk',
          page_size: 100,
        });
        setEvents(data);
        if (data.length > 0 && !selectedEventId) {
          setSelectedEventId(data[0].id);
        }
      } catch (err) {
        setError('Failed to load events. Please try again.');
        console.error('Error loading events:', err);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvents();
  }, [location]);

  // Filter events based on active filters
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filters.types.length > 0 && !filters.types.includes(event.type)) {
        return false;
      }
      if (filters.prices.length > 0) {
        const priceMatch = filters.prices.some((p) =>
          p.toLowerCase() === event.price
        );
        if (!priceMatch) return false;
      }
      if (filters.neighborhoods.length > 0 && event.neighborhood) {
        if (!filters.neighborhoods.includes(event.neighborhood)) {
          return false;
        }
      }
      if (filters.climate.length > 0 && event.climate) {
        const climateMatch = filters.climate.some((c) =>
          c.toLowerCase() === event.climate
        );
        if (!climateMatch) return false;
      }
      return true;
    });
  }, [events, filters]);

  const handleFilterPress = (filterType: string) => {
    setActiveFilterModal(filterType);
  };

  const handleFilterApply = (filterType: string, selected: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: selected,
    }));
  };

  const handleMarkerPress = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
  }, []);

  const handleBookmark = useCallback((eventId: string) => {
    setBookmarkedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  }, []);

  const handleSearchPress = () => {
    router.push('/map/search');
  };

  const handleSearchHere = () => {
    // In a real app, this would re-fetch events based on current map region
    console.log('Search here pressed');
  };

  const handleShowList = () => {
    setViewMode('list');
    // listTranslateY.value = withSpring(0, { damping: 2, stiffness: 20 });
    listTranslateY.value = withTiming(0, { duration: 600 });
  };

  const handleViewMap = (eventId: string) => {
    setViewMode('map');
    setSelectedEventId(eventId);
    listTranslateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
  };

  // const handleBack = () => {
  //   router.push("/")
  // }

  const animatedListStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: listTranslateY.value }],
  }));

  // Loading state
  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>Loading events...</Text>
        </View>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
          <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{error}</Text>
          <Button
            onPress={() => {
              setIsLoading(true);
              setError(null);
              eventsService.getAll({ city: location || 'Gdańsk', page_size: 100 })
                .then((data) => {
                  setEvents(data);
                  if (data.length > 0 && !selectedEventId) {
                    setSelectedEventId(data[0].id);
                  }
                })
                .catch(() => {
                  setError('Failed to load events');
                  setEvents([]);
                })
                .finally(() => setIsLoading(false));
            }}
          >
            Retry
          </Button>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Search Bar */}
        <View className="absolute top-0 left-0 right-0 z-10 bg-white pt-12 px-4 pb-3">
          <View className="flex-row items-center justify-center">
            {/* <Pressable onPress={handleBack} className="p-2">
              <Ionicons name="chevron-back-outline" size={24} color="black" />
            </Pressable> */}
            {/* Search Bar */}
            <View className="flex-1">
              <SearchBar
                placeholder="Search for events, places..."
                onPress={handleSearchPress}
                value={
                  location && query
                    ? `${query} in ${location}`
                    : location || query || undefined
                }
                iconName="search"
                editable={false}
              />
            </View>
          </View>
        </View>

        {/* Filter Bar */}
        <View className="absolute top-28 left-0 right-0 z-10">
          <FilterBar
            activeFilters={filters}
            onFilterPress={handleFilterPress}
          />
        </View>

        {/* Map View */}
        {viewMode === 'map' && (
          <>
            <View style={[styles.mapContainer, {bottom: insets.bottom}]}>
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                customMapStyle={actualTheme === 'dark' ? darkMapStyle : lightMapStyle}
                userInterfaceStyle={actualTheme}
                initialRegion={{
                  latitude: 54.3520,
                  longitude: 18.6466,
                  latitudeDelta: 0.08,
                  longitudeDelta: 0.08,
                }}
              >
                {filteredEvents.map((event) => (
                  <CustomMarker
                    key={event.id}
                    event={event}
                    isSelected={event.id === selectedEventId}
                    onPress={() => handleMarkerPress(event.id)}
                  />
                ))}
              </MapView>
            </View>

            <SearchHereButton onPress={handleSearchHere} />

            <MapEventCard
              events={filteredEvents}
              selectedEventId={selectedEventId}
              onBookmark={handleBookmark}
              bookmarkedEvents={bookmarkedEvents}
              onEventChange={setSelectedEventId}
            />

            {/* Show List Button */}
            <View
              className="absolute left-0 right-0 rounded-xl"
              style={{ bottom: insets.bottom }}
            >
              <Button
                onPress={handleShowList}
                type="solid"
                buttonStyle={{
                  backgroundColor: 'white',
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  paddingVertical: 16,
                }}
                containerStyle={{
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                }}
              >
                <Text style={{ color: 'black', fontWeight: '600', fontSize: 16, marginRight: 8 }}>
                  Show list of {filteredEvents.length} events
                </Text>
                <Ionicons name="chevron-up-outline" size={20} color="black" />
              </Button>
            </View>
          </>
        )}

      {/* List View - Animated Slide Up */}
      {viewMode === 'list' && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'white',
            },
            animatedListStyle,
          ]}
        >
        <View className="flex-1 pt-44 bg-white">
          <ScrollView className="flex-1 px-4">
            <Text style={{ fontSize: 14, marginBottom: 16, textAlign: 'center', paddingVertical: 16 }}>
              {filteredEvents.length} events
            </Text>
            {filteredEvents.map((event) => (
              <ListEventCard
                key={event.id}
                event={event}
                onBookmark={handleBookmark}
                isBookmarked={bookmarkedEvents.has(event.id)}
              />
            ))}
            <View className="h-32" />
          </ScrollView>

          {/* View Map Button - Fixed at Bottom */}
          <View className="absolute bottom-12 left-0 right-0 justify-center items-center">
            <Button
              onPress={() => handleViewMap(selectedEventId || filteredEvents[0]?.id)}
              type="solid"
              buttonStyle={{
                backgroundColor: 'black',
                borderRadius: 999,
                paddingVertical: 12,
                paddingHorizontal: 20,
              }}
              icon={<Ionicons name="map-outline" size={20} color="white" style={{ marginRight: 8 }} />}
              iconPosition="left"
            >
              View map
            </Button>
          </View>
        </View>
      </Animated.View>
      )}

      {/* Filter Modal */}
      {activeFilterModal && activeFilterModal === 'dates' ? (
        <DateFilterModal
          isVisible={true}
          onApply={(selectedDates) => {
            // Convert dates to filter format
            console.log('Selected dates:', selectedDates);
            setActiveFilterModal(null);
          }}
          onClose={() => setActiveFilterModal(null)}
        />
      ) : activeFilterModal && activeFilterModal === 'prices' ? (
        <PriceFilterModal
          isVisible={true}
          onApply={(minPrice, maxPrice) => {
            setFilters((prev) => ({
              ...prev,
              priceRange: { min: minPrice, max: maxPrice },
            }));
            setActiveFilterModal(null);
          }}
          onClose={() => setActiveFilterModal(null)}
          initialMin={filters.priceRange.min}
          initialMax={filters.priceRange.max}
        />
      ) : activeFilterModal && (
        <FilterModal
          isVisible={activeFilterModal !== null}
          filterType={activeFilterModal}
          options={filterOptions[activeFilterModal as keyof typeof filterOptions] as string[]}
          selectedOptions={filters[activeFilterModal as keyof typeof filters] as string[]}
          onApply={(selected) => {
            handleFilterApply(activeFilterModal, selected);
            setActiveFilterModal(null);
          }}
          onClose={() => setActiveFilterModal(null)}
        />
      )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    position: 'absolute',
    top: 160, // Search Bar (top-12 = 48px) + FilterBar height (~112px)
    left: 0,
    right: 0,
    bottom: 40
  },
  map: {
    width: '100%',
    height: '100%',
  },
});