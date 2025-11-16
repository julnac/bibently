import { useState, useCallback } from 'react';

const FAVORITES_KEY = 'eventfinder_favorites';

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      return storedFavorites ? new Set(JSON.parse(storedFavorites)) : new Set();
    } catch (error) {
      console.error("Failed to load favorites from localStorage", error);
      return new Set();
    }
  });

  const toggleFavorite = useCallback((eventId: string) => {
    const newIds = new Set(favoriteIds);
    if (newIds.has(eventId)) {
      newIds.delete(eventId);
    } else {
      newIds.add(eventId);
    }
    setFavoriteIds(newIds);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(newIds)));
    } catch (error) {
      console.error("Failed to save favorites to localStorage", error);
    }
  }, [favoriteIds]);

  return { favoriteIds, toggleFavorite };
}
