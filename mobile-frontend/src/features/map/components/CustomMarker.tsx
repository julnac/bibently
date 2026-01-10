import { useEffect, useState } from "react";
import { View } from "react-native";
import { Marker } from "react-native-maps";
import { Event } from "@/features/events/types";

interface CustomMarkerProps {
  event: Event;
  isSelected: boolean;
  onPress: () => void;
}

const CustomMarker = ({ event, isSelected, onPress }: CustomMarkerProps) => {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  useEffect(() => {
    // Allow initial render, then stop tracking to prevent flickering
    const timeout = setTimeout(() => {
      setTracksViewChanges(false);
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  // Re-enable tracking when selection changes, then disable again
  useEffect(() => {
    setTracksViewChanges(true);
    const timeout = setTimeout(() => {
      setTracksViewChanges(false);
    }, 100);

    return () => clearTimeout(timeout);
  }, [isSelected]);

  return (
    <Marker
      coordinate={event.coordinates}
      onPress={onPress}
      tracksViewChanges={tracksViewChanges}
    >
      <View
        style={{
          width: isSelected ? 32 : 24,
          height: isSelected ? 32 : 24,
          borderRadius: isSelected ? 16 : 12,
          backgroundColor: isSelected ? '#DC5B40' : '#FF8A65',
          borderWidth: isSelected ? 4 : 2,
          borderColor: 'white',
          elevation: isSelected ? 8 : 4,
        }}
      />
    </Marker>
  );
};

export default CustomMarker;
