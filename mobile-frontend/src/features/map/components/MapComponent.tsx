import React, { useEffect, useRef } from 'react';
import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
import CustomMarker from './CustomMarker';
import { StyleSheet, View } from 'react-native';
import { EventEntity } from '../../../core/types/event.types';
import { useTheme } from '@/core/state/ThemeContext';
import { darkMapStyle, lightMapStyle } from '@/features/map/config/map-styles';
import { useUserLocation } from '@/src/core/store/useLocation';
import { useFilterStore } from '@/src/core/store/useFilterStore';

export default function UniversalMap({ events, onMarkerPress, selectedEventId }: any) {
    const { actualTheme } = useTheme();
    const { location } = useUserLocation();
    const { filters } = useFilterStore();

    // Logika centrowania na wybranym evencie
    const mapRef = useRef<MapView>(null);
    useEffect(() => {
      if (selectedEventId && events) {
        const selectedEvent = events.find((e: EventEntity) => e.id === selectedEventId);

        const lat = selectedEvent?.location?.address?.latitude;
        const lng = selectedEvent?.location?.address?.longitude;
        console.log("Mapa centruje na:", selectedEvent?.name);
        
        if (lat && lng) {
          mapRef.current?.animateToRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }, 1000); // 1000ms = płynna animacja
        }
      }
    }, [selectedEventId]);

    return (
    <MapView
      ref={mapRef}
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
      showsUserLocation={false}
      showsMyLocationButton={false}
    >
      { (events ?? []).map((event: EventEntity) => (
        <CustomMarker
          key={event.id}
          event={event}
          isSelected={event.id === selectedEventId}
          onPress={() => onMarkerPress(event.id)}
        />
      ))}
      {location?.latitude && location?.longitude && (
        <Marker 
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          title="Tu jesteś"
          zIndex={1000}
          anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userLocationDot} />
        </Marker>
      )}
      {location?.latitude && location?.longitude && filters.RadiusKm && (
        <Circle
          center={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          radius={filters.RadiusKm * 1000}
          strokeWidth={2}
          strokeColor="rgba(60, 70, 255, 0.5)" 
          fillColor="rgba(60, 70, 255, 0.005)"
          zIndex={2}
        />
      )}

    </MapView>
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
  userLocationDot: {
    width: 16,
    height: 16,
    backgroundColor: '#3C46FF', // Kolor Bibently
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'white',
    // Efekt cienia (elevation dla Androida, shadow dla iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});