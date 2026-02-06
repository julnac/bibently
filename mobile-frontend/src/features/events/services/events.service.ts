import { apiClient } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { Event } from '../types/event.types';
import { EventAPIResponse, EventDTO } from '../types/EventDTO';
import { adaptEventFromAPI, adaptEventsFromAPI } from '../adapters/eventAdapter';

export interface EventFilters {
  name?: string;
  city?: string;
  type?: string;
  min_price?: number;
  max_price?: number;
  start_date?: string;
  end_date?: string;
  keywords?: string;
  page_size?: number;
  page_token?: string;
  sort_key?: string;
  sort_dir?: 'asc' | 'desc';
}

class EventsService {
  /**
   * Pobiera listę wszystkich wydarzeń z opcjonalnymi filtrami
   */
  async getAll(filters?: EventFilters): Promise<Event[]> {
    try {
      // Buduj query string z filtrów
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `${API_ENDPOINTS.events.list}?${queryString}`
        : API_ENDPOINTS.events.list;

      const response = await apiClient.get<EventAPIResponse>(endpoint);

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        return [];
      }

      const events = Array.isArray(response.data) ? response.data : [response.data];
      return adaptEventsFromAPI(events as EventDTO[]);

    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Pobiera szczegóły pojedynczego wydarzenia po ID
   */
  async getById(id: string): Promise<Event> {
    try {
      const response = await apiClient.get<EventAPIResponse>(
        API_ENDPOINTS.events.detail(id)
      );

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.data) {
        throw new Error('Event not found');
      }

      return adaptEventFromAPI(response.data as EventDTO);

    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw error;
    }
  }

  /**
   * Tworzy nowe wydarzenie (opcjonalne - do przyszłej implementacji)
   */
  async create(eventData: Partial<EventDTO>): Promise<string> {
    try {
      const response = await apiClient.post<EventAPIResponse>(
        API_ENDPOINTS.events.list,
        eventData
      );

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data as string; // Returns event ID
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Aktualizuje wydarzenie (opcjonalne - do przyszłej implementacji)
   */
  async update(id: string, updates: Partial<EventDTO>): Promise<void> {
    try {
      await apiClient.put(API_ENDPOINTS.events.detail(id), updates);
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      throw error;
    }
  }

  /**
   * Usuwa wydarzenie (opcjonalne - do przyszłej implementacji)
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.events.detail(id));
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      throw error;
    }
  }
}

export const eventsService = new EventsService();
