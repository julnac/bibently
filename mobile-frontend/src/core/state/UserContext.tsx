import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RecentSearch {
  id: string;
  location: string;
  query: string;
  timestamp: number;
}

export interface UserSettings {
  defaultCity?: string;
  notifications?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

interface UserContextType {
  recentSearches: RecentSearch[];
  userSettings: UserSettings;
  addRecentSearch: (location: string, query: string) => void;
  clearRecentSearches: () => void;
  removeRecentSearch: (id: string) => void;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const RECENT_SEARCHES_KEY = '@bibently_recent_searches';
const USER_SETTINGS_KEY = '@bibently_user_settings';
const MAX_RECENT_SEARCHES = 5;

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>({
    notifications: true,
    theme: 'auto',
  });

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadRecentSearches();
    loadUserSettings();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const loadUserSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(USER_SETTINGS_KEY);
      if (stored) {
        setUserSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const addRecentSearch = async (location: string, query: string) => {
    try {
      const newSearch: RecentSearch = {
        id: Date.now().toString(),
        location,
        query,
        timestamp: Date.now(),
      };

      // Remove duplicates and add new search
      const filtered = recentSearches.filter(
        (search) => !(search.location === location && search.query === query)
      );

      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding recent search:', error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  const removeRecentSearch = async (id: string) => {
    try {
      const updated = recentSearches.filter((search) => search.id !== id);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing recent search:', error);
    }
  };

  const updateUserSettings = async (settings: Partial<UserSettings>) => {
    try {
      const updated = { ...userSettings, ...settings };
      setUserSettings(updated);
      await AsyncStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating user settings:', error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        recentSearches,
        userSettings,
        addRecentSearch,
        clearRecentSearches,
        removeRecentSearch,
        updateUserSettings,     
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
