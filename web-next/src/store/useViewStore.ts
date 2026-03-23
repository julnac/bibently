'use client';

import { create } from 'zustand';

type ViewMode = 'list' | 'map';

interface ViewStore {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    toggleViewMode: () => void;
}

export const useViewStore = create<ViewStore>((set) => ({
    viewMode: 'list',
    setViewMode: (mode) => set({ viewMode: mode }),
    toggleViewMode: () =>
        set((state) => ({ viewMode: state.viewMode === 'list' ? 'map' : 'list' })),
}));
