import apiClient from '../api/apiClient';
import { TrackingEvent } from '../types/tracking.types';

export const trackingService = {
  postTracking: async (trackingData: TrackingEvent) => {
    const response = await apiClient.post('/tracking', trackingData);
    return response.data;
  },
  
  deleteTracking: async (id: string) => {
    const response = await apiClient.delete(`/tracking/${id}`);
    return response.data;
  },

  getTracking: async (id: string) => {
    const response = await apiClient.get<TrackingEvent>(`/tracking/${id}`);
    return response.data;
  }
};