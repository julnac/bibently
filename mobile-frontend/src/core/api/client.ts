import { authService } from '../auth/authService';

const API_BASE_URL = process.env.API_URL || "http://10.0.2.2:3000";

export interface ApiClientConfig {
  baseURL?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(config?: ApiClientConfig) {
    this.baseURL = config?.baseURL || API_BASE_URL;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = await authService.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      // Token already includes "Bearer " prefix, so use it directly
      headers['Authorization'] = token;
    }

    return headers;
  }

  async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const headers = await this.getHeaders();
      const url = `${this.baseURL}${endpoint}`;

      // Debug logging
      if (__DEV__) {
        console.log(`[API] Fetching: ${url}`);
        console.log(`[API] Base URL: ${this.baseURL}`);
        console.log(`[API] Headers:`, headers);
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
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
