const API_BASE_URL = process.env.API_URL || "http://192.168.1.25:5001";

export interface ApiClientConfig {
  baseURL?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(config?: ApiClientConfig) {
    this.baseURL = config?.baseURL || API_BASE_URL;
  }

  async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      // Log raw response for debugging
      const text = await response.text();
      if (__DEV__) {
        console.log(`API ${endpoint} RAW =>`, text);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return JSON.parse(text) as T;
    } catch (error) {
      console.error(`API fetch error (${endpoint}):`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
