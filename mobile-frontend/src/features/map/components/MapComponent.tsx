import React, { useEffect, useRef } from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import CustomMarker from './CustomMarker';
import { StyleSheet } from 'react-native';
import { EventEntity } from '../../../core/types/event.types';
import { useTheme } from '@/core/state/ThemeContext';
import { darkMapStyle, lightMapStyle } from '@/features/map/config/map-styles';

export default function UniversalMap({ events, onMarkerPress, selectedEventId }: any) {
    const { actualTheme } = useTheme();

    // Logika centrowania na wybranym evencie
    const mapRef = useRef<MapView>(null);
    useEffect(() => {
      if (selectedEventId && events) {
        const selectedEvent = events.find((e: EventEntity) => e.id === selectedEventId);

        // const lat = selectedEvent?.location?.address?.latitude;
        // const lng = selectedEvent?.location?.address?.longitude;
        const coords = selectedEvent?.location?.address;
        console.log("Mapa centruje na:", selectedEvent?.name);
        
        if (coords?.latitude && coords?.longitude) {
          mapRef.current?.animateToRegion({
            latitude: selectedEvent.latitude - 0.005, // Lekki offset w dół, żeby karta eventu nie zasłaniała markera
            longitude: selectedEvent.longitude,
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
    >
      { (events ?? []).map((event: EventEntity) => (
        <CustomMarker
          key={event.id}
          event={event}
          isSelected={event.id === selectedEventId}
          onPress={() => onMarkerPress(event.id)}
        />
      ))}
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
});