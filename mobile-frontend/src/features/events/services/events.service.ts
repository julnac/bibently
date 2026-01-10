import { apiClient, API_ENDPOINTS } from '@/core/api';
import type { Event } from '../types';

export const eventsService = {
  /**
   * Get all events
   */
  async getAll(): Promise<Event[]> {
    return apiClient.get<Event[]>(API_ENDPOINTS.events.list);
  },

  /**
   * Get event by ID
   */
  async getById(id: string): Promise<Event> {
    return apiClient.get<Event>(API_ENDPOINTS.events.detail(id));
  },

  // Future methods can be added here:
  // async create(event: Partial<Event>): Promise<Event> {
  //   return apiClient.post<Event>(API_ENDPOINTS.events.list, event);
  // },
  // async update(id: string, event: Partial<Event>): Promise<Event> {
  //   return apiClient.put<Event>(API_ENDPOINTS.events.detail(id), event);
  // },
  // async delete(id: string): Promise<void> {
  //   return apiClient.delete<void>(API_ENDPOINTS.events.detail(id));
  // },
};
