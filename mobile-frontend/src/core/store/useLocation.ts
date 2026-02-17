import * as Location from 'expo-location';
import { create } from 'zustand';

interface Coordinates {
    latitude: number | null,
    longitude: number | null
}

type Status = "undetermined" | "granted" | "denied" | null;

interface LocationState {
    location: Coordinates | null;
    errorMsg: string | null;
    status: Status;
    setLocation: (loc: Coordinates) => void;
    setStatus: (st: Status) => void;
}

// Store do zarządzania stanem lokalizacji
const useLocationStore = create<LocationState>((set) => ({
  location: null,
  errorMsg: null,
  status: null,
  setLocation: (loc) => set({ location: loc }),
  setStatus: (st) => set({ status: st }),
}));

export const useUserLocation = () => {
  const { location, status, setLocation, setStatus } = useLocationStore();

  const requestLocation = async () => {
    // 1. Sprawdź obecny status
    let { status: existingStatus } = await Location.getForegroundPermissionsAsync();
    
    // 2. Jeśli nie mamy pozwolenia, zapytaj
    if (existingStatus !== 'granted') {
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      existingStatus = newStatus;
    }

    setStatus(existingStatus);

    if (existingStatus === 'granted') {
      const currentLoc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLoc.coords);
      return currentLoc.coords;
    }
    return null;
  };

  return { location, status, requestLocation };
};