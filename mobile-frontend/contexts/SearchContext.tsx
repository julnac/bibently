import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SearchFilters {
  types: string[];
  dates: string[];
  prices: string[];
  distance: string | null;
  neighborhoods: string[];
  climate: string[];
}

interface SearchContextType {
  location: string;
  query: string;
  filters: SearchFilters;
  setLocation: (location: string) => void;
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  updateFilter: (filterType: keyof SearchFilters, value: string[] | string | null) => void;
  clearSearch: () => void;
  clearFilters: () => void;
}

const defaultFilters: SearchFilters = {
  types: [],
  dates: [],
  prices: [],
  distance: null,
  neighborhoods: [],
  climate: [],
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [location, setLocation] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);

  const updateFilter = (filterType: keyof SearchFilters, value: string[] | string | null) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const clearSearch = () => {
    setLocation('');
    setQuery('');
    setFilters(defaultFilters);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <SearchContext.Provider
      value={{
        location,
        query,
        filters,
        setLocation,
        setQuery,
        setFilters,
        updateFilter,
        clearSearch,
        clearFilters,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
