import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: automatically attach auth token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: global error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // Handle 401 — session expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('Sesja wygasła. Przekierowanie do logowania...');

      if (typeof window !== 'undefined') {
        localStorage.removeItem('userToken');
        window.location.href = '/login';
      }
    }

    const errorMessage = error.response?.data?.message || 'Wystąpił nieoczekiwany błąd';
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;