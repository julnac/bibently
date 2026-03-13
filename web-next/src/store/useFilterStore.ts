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
    City: 'Gdańsk',
    PageSize: 20,
  },

  setFilters: (newParams) =>
    set((state) => ({
      filters: { ...state.filters, ...newParams },
    })),

  setDates: (start, end) =>
    set((state) => ({
      filters: {
        ...state.filters,
        StartDate: start ? `${start}T00:00:00Z` : undefined,
        EndDate: end ? `${end}T23:59:59Z` : undefined,
      },
    })),

  setPrices: (min, max) =>
    set((state) => ({
      filters: {
        ...state.filters,
        MinPrice: min !== null ? min : undefined,
        MaxPrice: max !== null ? max : undefined,
      },
    })),

  setCategory: (category) =>
    set((state) => ({
      filters: { ...state.filters, Category: category },
    })),

  setCity: (city) =>
    set((state) => ({
      filters: { ...state.filters, City: city },
    })),

  resetFilters: () =>
    set({
      filters: { City: 'Gdańsk', PageSize: 20, PageToken: undefined },
    }),

  resetLocalizationFilters: () =>
    set((state) => ({
      filters: {
        ...state.filters,
        Latitude: undefined,
        Longitude: undefined,
        RadiusKm: undefined,
        City: undefined,
        PageToken: undefined,
      },
    })),

  setGPSLocation: (lat, lon) =>
    set((state) => ({
      filters: {
        ...state.filters,
        Latitude: lat,
        Longitude: lon,
        RadiusKm: 10,
        City: undefined,
        PageToken: undefined,
      },
    })),

  setSorting: (key, order) =>
    set((state) => ({
      filters: {
        ...state.filters,
        SortKey: key,
        Order: order,
        PageToken: undefined,
      },
    })),
}));