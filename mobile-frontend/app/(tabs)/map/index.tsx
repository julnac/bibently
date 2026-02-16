import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, StyleSheet, View, ActivityIndicator, Pressable, Text } from 'react-native';
import { Button } from '@rneui/themed';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FilterBar from '../../../src/features/map/components/filters/FilterBar';
import ListEventCard from '../../../src/features/map/components/ListEventCard';
import MapEventCard from '../../../src/features/map/components/MapEventCard';
import SearchHereButton from '../../../src/features/map/components/SearchHereButton';
import SearchBar from '../../../src/features/search/components/SearchBar';
import { useEvents } from '../../../src/core/hooks/useEvents';
import UniversalMap from '../../../src/features/map/components/MapComponent';
import { FlatList } from 'react-native-gesture-handler';
import { useFilterStore } from '@/src/core/store/useFilterStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const filters = useFilterStore((state) => state.filters);
  const { resetFilters } = useFilterStore()
  const { data: events, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useEvents(filters);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Animacja - lista zaczyna poza ekranem (SCREEN_HEIGHT)
  const listTranslateY = useSharedValue(SCREEN_HEIGHT);

  const handleMarkerPress = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
  }, []);

  const handleSearchPress = () => {
    router.push('/map/search');
  };

  const handleSearchHere = () => {
    // In a real app, this would re-fetch events based on current map region
    console.log('Search here pressed');
  };

  const handleViewList = () => {
    setViewMode('list');
    listTranslateY.value = withTiming(0, { duration: 600 });
  };

  const handleViewMap = () => {
    setViewMode('map');
    listTranslateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 });
  };

  const animatedListStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: listTranslateY.value }],
    // Dodatkowo: możemy animować opacity, żeby mapa nie "przebijała" pod spodem, gdy lista jest aktywna
    // opacity: listTranslateY.value === SCREEN_HEIGHT ? 0 : 1, 
  }));

  const getSearchLabel = () => {
    const hasKeywords = filters.Keywords && filters.Keywords.length > 0;
    const hasCity = !!filters.City;
    const keywordsText = hasKeywords ? filters.Keywords?.join(' ') : filters.Name;

    if (keywordsText && hasCity) {
      return `${keywordsText} w: ${filters.City}`;
    }
    return keywordsText || filters.City || "Szukaj wydarzeń...";
  };

  return (
    <>
      <View style={styles.container}>
        {/* FIXED HEADER (Search + Filters) */}
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <SearchBar
            placeholder="Szukaj wydarzeń, miejsc..."
            onPress={handleSearchPress}
            value={getSearchLabel()}
            iconName="search"
            editable={false}
          />
          <FilterBar/>
        </View>

        {/* BACKGROUND: MAP VIEW */}
        <View style={styles.mapWrapper}>
          <UniversalMap 
            events={events}
            onMarkerPress={handleMarkerPress}
            selectedEventId={selectedEventId}
          />
          {viewMode === 'map' && (
            <>
              <SearchHereButton onPress={handleSearchHere} />
              <MapEventCard
                events={events ?? []}
                selectedEventId={selectedEventId}
                onEventChange={setSelectedEventId}
              />
              <View style={[styles.showListButtonWrapper, { bottom: 0 }]}>
                <Button
                  onPress={handleViewList}
                  type="solid"
                  // do przeniesienia od stylów
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
                    Lista wydarzeń
                  </Text>
                  <Ionicons name="chevron-up-outline" size={20} color="black" />
                </Button>
              </View>
            </>
          )}
        </View>

      {/* FOREGROUND: ANIMATED LIST VIEW */}
      <Animated.View style={[styles.listOverlay, animatedListStyle]}>
        {/* <View className="flex-1 pt-44 bg-white"> */}
          <FlatList
            data={events}
            contentContainerStyle={{ paddingTop: 180, paddingBottom: 100, paddingLeft: 10, paddingRight:10 }}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ListEventCard
                event={item}
              />
            )}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
            }}
            onEndReachedThreshold={0.5}
            refreshing={isLoading} 
            onRefresh={refetch}
            ListFooterComponent={
              isFetchingNextPage ? (
                <ActivityIndicator style={{ marginVertical: 20 }} color="#007AFF" />
              ) : <View style={{ height: 20 }} /> // Margines na dole
            }
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>Brak wydarzeń dla tych filtrów</Text>
                  <Button 
                    title="Resetuj filtry" 
                    type="clear" 
                    onPress={() => resetFilters()} 
                  />
                </View>
              ) : null
            }
          />

          {/* View Map Button - Fixed at Bottom */}
          <View style={[styles.viewMapButtonWrapper, { bottom: insets.bottom >= 0 ? insets.bottom : 20 }]}>
            <Pressable 
              onPress={handleViewMap} 
              className="flex-row items-center bg-gray-800 px-6 py-4 rounded-full shadow-lg"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
            >
              <Ionicons name="map-outline" size={16} color="white" />
              <Text className="ml-2 text-sm text-white">Widok mapy</Text>
            </Pressable>
          </View>
        {/* </View> */}
      </Animated.View>

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 0,
    margin: 0, 
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.45)', // Półprzezroczyste białe tło
    paddingBottom: 2,
    // Opcjonalnie: dodaj delikatny cień, żeby header odcinał się od mapy
  },
  mapWrapper: {
    ...StyleSheet.absoluteFillObject, // Mapa zajmuje cały ekran pod spodem
  },
  listOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#e7e7e7",
    zIndex: 50, // Wyżej niż mapa, niżej niż header
  },
  showListButtonWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  viewMapButtonWrapper: {
    position: 'absolute',
    alignSelf: 'center',
  },
  MapViewButton: {
    backgroundColor: 'black',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  MapViewButtonContainer: {
    borderRadius: 999,
    overflow: 'hidden', // Zapobiega "wyciekaniu" tła na rogach
  },
  MapViewButtonTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 12,
  }
});