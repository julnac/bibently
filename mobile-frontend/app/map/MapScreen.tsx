import { View, StyleSheet } from "react-native";
import MapView, { UrlTile, PROVIDER_DEFAULT } from "react-native-maps";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}   // ważne – NIE Google Maps
        style={styles.map}
        initialRegion={{
          latitude: 54.3520,          // np. Gdańsk
          longitude: 18.6466,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* OpenStreetMap tiles */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
