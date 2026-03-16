import { create } from 'zustand';
import { EventQueryParams } from '../types/event.params';
import { SortDirection } from '../types/api.types';
import { EventSortableAccessor } from '../types/event.types';

interface FilterState {
  filters: EventQueryParams;
  setFilters: (newFilters: Partial<EventQueryParams>) => void;
  setDates: (start: string | null, end: string | null) => void;
  setPrices: (min: number | null, max: number | null) => void;
  setCategory: (category: string | undefined) => void;
  setCity: (city: string) => void;
  resetFilters: () => void;
  resetLocalizationFilters: () => void;
  setGPSLocation: (lat: number, lon: number) => void;
  setSorting: (key: EventSortableAccessor, order: SortDirection) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  filters: {
    city: 'Gdańsk',
    pageSize: 20,
  },

  setFilters: (newParams) =>
    set((state) => ({
      filters: { ...state.filters, ...newParams },
    })),

  setDates: (start, end) =>
    set((state) => ({
      filters: {
        ...state.filters,
        startDate: start ? `${start}T00:00:00Z` : undefined,
        endDate: end ? `${end}T23:59:59Z` : undefined,
      },
    })),

  setPrices: (min, max) =>
    set((state) => ({
      filters: {
        ...state.filters,
        minPrice: min !== null ? min : undefined,
        maxPrice: max !== null ? max : undefined,
      },
    })),

  setCategory: (category) =>
    set((state) => ({
      filters: { ...state.filters, category: category },
    })),

  setCity: (city) =>
    set((state) => ({
      filters: { ...state.filters, city: city },
    })),

  resetFilters: () =>
    set({
      filters: { city: 'Gdańsk', pageSize: 20, pageToken: undefined },
    }),

  resetLocalizationFilters: () =>
    set((state) => ({
      filters: {
        ...state.filters,
        latitude: undefined,
        longitude: undefined,
        radiusKm: undefined,
        city: undefined,
        pageToken: undefined,
      },
    })),

  setGPSLocation: (lat, lon) =>
    set((state) => ({
      filters: {
        ...state.filters,
        latitude: lat,
        longitude: lon,
        radiusKm: 10,
        city: undefined,
        pageToken: undefined,
      },
    })),

  setSorting: (key, order) =>
    set((state) => ({
      filters: {
        ...state.filters,
        sortKey: key,
        order: order,
        pageToken: undefined,
      },
    })),
}));