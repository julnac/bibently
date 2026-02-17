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
import Slider from '@react-native-community/slider';
import { useUserLocation } from "@/core/store/useLocation";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Index() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const filters = useFilterStore((state) => state.filters);
  const setFilters = useFilterStore((state) => state.setFilters);
  const resetFilters = useFilterStore((state) => state.resetFilters);
  const { data: events, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useEvents(filters);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const { location } = useUserLocation();

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
    const keywordsText = hasKeywords ? filters.Keywords?.join(' ') : filters.Name;
    const currentLocation = filters.Latitude ? 'Moja lokalizacja' : null

    if (keywordsText && filters.City) {
      return `${keywordsText} w: ${filters.City}`;
    }
    if (keywordsText && filters.Latitude) {
      return `${keywordsText} w: ${currentLocation}`;
    }
    return keywordsText || filters.City || currentLocation || "Szukaj wydarzeń...";
  };

  const centerOnUser = () => {
    // if (deviceLocation) {
    //   mapRef.current?.animateToRegion({
    //     latitude: deviceLocation.lat,
    //     longitude: deviceLocation.lng,
    //     latitudeDelta: 0.02,
    //     longitudeDelta: 0.02,
    //   }, 1000);
    // } else {
      console.log("Centrowanie jeszcze nie działa");
    // }
  };

  // Funkcja aktualizująca promień w Store
  const handleRadiusChange = (value: number) => {
    setFilters({ RadiusKm: value });
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
              {filters.RadiusKm && (
                <View style={styles.rightToolbar}>
                  {/* Przycisk Lokalizacji */}
                  <Pressable 
                    onPress={centerOnUser}
                    style={styles.toolbarButton}
                    className="shadow-md active:bg-gray-100"
                  >
                    <Ionicons name="location" size={24} color={location ? "#3C46FF" : "#666"} />
                  </Pressable>

                  {/* Slider Promienia */}
                  <View style={styles.sliderContainer}>
                    <Text style={styles.sliderText}>{filters.RadiusKm}km</Text>
                    <View style={styles.sliderWrapper}>
                      <Slider
                        style={{ 
                          width: 150, 
                          height: 40, 
                          transform: [{ rotate: '-90deg' }] 
                        }}
                        minimumValue={1}
                        maximumValue={50}
                        step={1}
                        value={filters.RadiusKm ? filters.RadiusKm : 5}
                        onSlidingComplete={handleRadiusChange}
                        minimumTrackTintColor="#3C46FF"
                        maximumTrackTintColor="#888888"
                        thumbTintColor="#3C46FF"
                        // vertical={true}
                      />
                    </View>
                  </View>
                </View>
              )}
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
  },
  rightToolbar: {
    position: 'absolute',
    right: 16,
    top: 180, 
    bottom: 250, 
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  toolbarButton: {
    width: 45,
    height: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  sliderContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 30,
    width: 45,
    height: 220,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    elevation: 4,
  },
  sliderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
  sliderText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3C46FF',
  },
});