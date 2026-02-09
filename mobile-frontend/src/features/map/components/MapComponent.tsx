import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import CustomMarker from './CustomMarker';
import { StyleSheet} from 'react-native';
import { EventEntity } from '../../../core/types/event.types';
import { useTheme } from '@/core/state/theme';
import { darkMapStyle, lightMapStyle } from '@/features/map/config/map-styles';

export default function UniversalMap({ events, onMarkerPress, selectedEventId }: any) {
    const { actualTheme } = useTheme();
  
    return (
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
      {events.map((event: EventEntity) => (
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