import { useSearch } from '@/features/search/context/SearchContext';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import FilterBar from '../../components/map/FilterBar';
import FilterModal from '../../components/map/FilterModal';
import ListEventCard from '../../components/map/ListEventCard';
import SearchBar from '../../components/search/SearchBar';
import { mockEvents } from '../../src/data/mockEvents';

const filterOptions = {
  types: ['Concert', 'Sport', 'Workshop', 'Party', 'Festival', 'Theater'],
  dates: ['Today', 'Tomorrow', 'This Week', 'This Month'],
  prices: ['Free', 'Paid'],
  distance: ['1 km', '5 km', '10 km', '25 km'],
  neighborhoods: ['Wrzeszcz', 'Śródmieście', 'Oliwa', 'Zaspa', 'Brzeźno', 'Jelitkowo', 'Stogi'],
  climate: ['Indoor', 'Outdoor'],
};

export default function MapScreen() {
  const router = useRouter();
  const [bookmarkedEvents, setBookmarkedEvents] = useState<Set<string>>(new Set());
  const [activeFilterModal, setActiveFilterModal] = useState<string | null>(null);
  const { location, query } = useSearch();

  const [filters, setFilters] = useState({
    types: [] as string[],
    dates: [] as string[],
    prices: [] as string[],
    distance: null as string | null,
    neighborhoods: [] as string[],
    climate: [] as string[],
  });

  // Filter events based on active filters
  const filteredEvents = useMemo(() => {
    return mockEvents.filter((event) => {
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
  }, [filters]);

  const handleFilterPress = (filterType: string) => {
    setActiveFilterModal(filterType);
  };

  const handleFilterApply = (filterType: string, selected: string[]) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: selected,
    }));
  };

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
    router.push('/map/SearchScreen');
  };

  const handleBack = () => {
    router.push("/map/SearchScreen");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Search Bar */}
        <View className="absolute top-0 left-0 right-0 z-10 bg-white pt-12 px-4 pb-3">
          <View className="flex-row items-center justify-center">
            <Pressable onPress={handleBack} className="p-2">
              <Ionicons name="chevron-back-outline" size={24} color="black" />
            </Pressable>
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

        {/* Web placeholder for map */}
        <View style={styles.mapPlaceholder}>
          <Text style={styles.placeholderText}>
            Map view is only available on mobile
          </Text>
          <Text style={styles.placeholderSubtext}>
            Browse events in the list below
          </Text>
        </View>

        {/* List View */}
        <View style={styles.listContainer}>
          <ScrollView className="flex-1 px-4">
            <Text className="text-lg font-semibold mb-4">
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
        </View>

        {/* Filter Modal */}
        {activeFilterModal && (
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
  mapPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 160,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  listContainer: {
    flex: 1,
    marginTop: 60,
  },
});
