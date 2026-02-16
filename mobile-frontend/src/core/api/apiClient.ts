import axios from 'axios';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const BASE_URL = 'http://localhost:5001/api/v1'; 
const BASE_URL  = process.env.API_URL || "http://192.168.1.25:5001/api/v1";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor do automatycznego dodawania tokena (np. z Firebase)
apiClient.interceptors.request.use(
  async (config) => {
    // Tutaj pobierz token ze swojego store'a (np. Redux, Zustand lub AsyncStorage)
    // Pobierz token z AsyncStorage (zapisanego np. po logowaniu w Firebase)
    // const token = 'TWÓJ_TOKEN_FIREBASE'; 
    const token = await AsyncStorage.getItem('userToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR ODPOWIEDZI: Obsługa błędów globalnych
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Obsługa błędu 401 - Token wygasł lub jest nieprawidłowy
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Logika wylogowania lub odświeżenia tokenu
      console.warn("Sesja wygasła. Przekierowanie do logowania...");
      
      await AsyncStorage.removeItem('userToken');
      
      // Wykorzystujemy expo-router do przekierowania na ekran logowania
      router.replace('/login');
    }

    // Obsługa innych błędów (np. 404, 500)
    const errorMessage = error.response?.data?.message || 'Wystąpił nieoczekiwany błąd';
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;