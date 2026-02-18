import { create } from 'zustand';

interface Coordinates {
  latitude: number | null;
  longitude: number | null;
}

type Status = 'undetermined' | 'granted' | 'denied' | null;

interface LocationState {
  location: Coordinates | null;
  errorMsg: string | null;
  status: Status;
  setLocation: (loc: Coordinates) => void;
  setStatus: (st: Status) => void;
}

// Store for location state management
const useLocationStore = create<LocationState>((set) => ({
  location: null,
  errorMsg: null,
  status: null,
  setLocation: (loc) => set({ location: loc }),
  setStatus: (st) => set({ status: st }),
}));

export const useUserLocation = () => {
  const { location, status, setLocation, setStatus } = useLocationStore();

  const requestLocation = async (): Promise<Coordinates | null> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setStatus('denied');
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(coords);
          setStatus('granted');
          resolve(coords);
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          setStatus('denied');
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    });
  };

  return { location, status, requestLocation };
};