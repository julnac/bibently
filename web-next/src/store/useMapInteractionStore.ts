import { create } from 'zustand';

interface MapInteractionState {
    hoveredEventId: string | null;
    setHoveredEventId: (id: string | null) => void;
}

/**
 * Lightweight Zustand store for hover synchronization
 * between EventCard (list) and MapMarker (map).
 */
export const useMapInteractionStore = create<MapInteractionState>((set) => ({
    hoveredEventId: null,
    setHoveredEventId: (id) => set({ hoveredEventId: id }),
}));
