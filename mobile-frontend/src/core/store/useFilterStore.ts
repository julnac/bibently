import { create } from 'zustand';
import { EventQueryParams } from '../types/event.params';

interface FilterState {
  filters: EventQueryParams;
  setFilters: (newFilters: Partial<EventQueryParams>) => void;
  setDates: (start: string | null, end: string | null) => void;
  setPrices: (min: number | null, max: number | null) => void;
  setCategory: (type: string | undefined) => void;
  setCity: (city: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  // Stan początkowy zgodny z EventQueryParams
  filters: {
    City: 'Gdańsk',
    PageSize: 20,
  },
  
  setFilters: (newParams) => set((state) => ({
    filters: {
      ...state.filters,
      ...newParams
    }
  })),

  setDates: (start, end) => set((state) => ({
    filters: {
      ...state.filters,
      // Formatujemy od razu pod API jeśli trzeba, lub trzymamy YYYY-MM-DD
      StartDate: start ? `${start}T00:00:00Z` : undefined,
      EndDate: end ? `${end}T23:59:59Z` : undefined,
    }
  })),

  setPrices: (min, max) => set((state) => ({
    filters: {
        ...state.filters,
        MinPrice: min !== null ? min : undefined,
        MaxPrice: max !== null ? max : undefined,
    }
  })),

  setCategory: (type) => set((state) => ({
    filters: { ...state.filters, Type: type }
  })),

  setCity: (city) => set((state) => ({
    filters: { ...state.filters, City: city }
  })),

  resetFilters: () => set({
    filters: { City: 'Gdańsk', PageSize: 20 }
  }),
}));