import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sprawdź czy użytkownik jest już zalogowany przy starcie apki
    const loadStorageData = async () => {
      try {
        const authData = await AsyncStorage.getItem('userToken');
        if (authData) setToken(authData);
      } finally {
        setIsLoading(false);
      }
    };
    loadStorageData();
  }, []);

  const login = async (newToken: string) => {
    setToken(newToken);
    await AsyncStorage.setItem('userToken', newToken);
    router.replace('/map'); 
  };

  const logout = async () => {
    setToken(null);
    await AsyncStorage.removeItem('userToken');
    router.replace('/login');
  };

  return (
    <AuthContext.Provider 
        value={{ 
            token, 
            isAuthenticated: !!token, 
            login, 
            logout, 
            isLoading 
        }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Twój Hook useAuth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};