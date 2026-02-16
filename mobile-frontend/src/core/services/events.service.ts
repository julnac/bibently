import apiClient from '../api/apiClient';
import { EventEntity } from '../types/event.types';
import { ApiPaginationResponse } from '../types/api.types';
import { EventQueryParams } from '../types/event.params';

export const eventService = {
  // GET: Pobieranie listy z filtrami
  getEvents: async (filters: EventQueryParams) => {

    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v != null)
    );
    
    const response = await apiClient.get<ApiPaginationResponse>('/events', { params });
    return response.data;
  },

  // GET: Pojedyncze wydarzenie
  getEventById: async (id: string) => {
    const response = await apiClient.get<EventEntity>(`/events/${id}`);
    return response.data;
  },

  // POST: Tworzenie wydarzenia TU JEST BŁĄD, TRZEBA DODAĆ CREATEEVENTDTO W BACKENDZIE
  createEvent: async (event: Partial<EventEntity>) => {
    const response = await apiClient.post<EventEntity>('/events', event);
    return response.data;
  },

  // DELETE: Usuwanie
  deleteEvent: async (id: string) => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.status === 200;
  },

  // POST: Masowe dodawanie
  bulkCreateEvents: async (events: EventEntity[]) => {
    const response = await apiClient.post('/events/bulk', events);
    return response.status === 200;
  }
};