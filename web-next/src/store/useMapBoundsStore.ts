import { create } from 'zustand';

export interface MapBounds {
  northEast: { lat: number; lng: number };
  southWest: { lat: number; lng: number };
}

interface MapBoundsState {
  isMapFilteringEnabled: boolean;
  setIsMapFilteringEnabled: (enabled: boolean) => void;
  mapBounds: MapBounds | null;
  setMapBounds: (bounds: MapBounds | null) => void;
  isMapMoving: boolean;
  setIsMapMoving: (isMoving: boolean) => void;
}

export const useMapBoundsStore = create<MapBoundsState>((set) => ({
  isMapFilteringEnabled: false,
  setIsMapFilteringEnabled: (enabled) => set({ isMapFilteringEnabled: enabled }),
  mapBounds: null,
  setMapBounds: (bounds) => set({ mapBounds: bounds }),
  isMapMoving: false,
  setIsMapMoving: (isMoving) => set({ isMapMoving: isMoving }),
}));
