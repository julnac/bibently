'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in on mount
    const loadStorageData = () => {
      try {
        const authData = localStorage.getItem('userToken');
        if (authData) setToken(authData);
      } finally {
        setIsLoading(false);
      }
    };
    loadStorageData();
  }, []);

  const login = async (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('userToken', newToken);
    router.replace('/');
  };

  const logout = async () => {
    setToken(null);
    localStorage.removeItem('userToken');
    router.replace('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};