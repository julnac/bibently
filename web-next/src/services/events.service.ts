import apiClient from './apiClient';
import { EventEntity } from '../types/event.types';
import { ApiPaginationResponse } from '../types/api.types';
import { EventQueryParams } from '../types/event.params';

export const eventService = {
  // GET: List with filters
  getEvents: async (filters: EventQueryParams): Promise<ApiPaginationResponse> => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v != null)
    );

    const response = await apiClient.get<ApiPaginationResponse>('/events', { params });
    return response.data;
  },

  // GET: Single event
  getEventById: async (id: string): Promise<EventEntity> => {
    const response = await apiClient.get<EventEntity>(`/events/${id}`);
    return response.data;
  },

  // POST: Create event
  createEvent: async (event: Partial<EventEntity>): Promise<EventEntity> => {
    const response = await apiClient.post<EventEntity>('/events', event);
    return response.data;
  },

  // DELETE: Delete event
  deleteEvent: async (id: string): Promise<boolean> => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.status === 200;
  },

  // POST: Bulk create
  bulkCreateEvents: async (events: EventEntity[]): Promise<boolean> => {
    const response = await apiClient.post('/events/bulk', events);
    return response.status === 200;
  },
};