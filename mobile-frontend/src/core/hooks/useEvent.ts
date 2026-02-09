import { useState, useEffect, useCallback } from 'react';
import { eventService } from '../services/events.service';
import { EventEntity } from '../types/event.types';

export const useEvent = (id: string | string[] | undefined) => {
  const [event, setEvent] = useState<EventEntity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!id || typeof id !== 'string') return; // Walidacja ID z parametrów trasy

    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getEventById(id);
      setEvent(data);
    } catch (err: any) {
      setError(err.message || 'Nie udało się pobrać szczegółów wydarzenia');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return { event, loading, error, refresh: fetchEvent };
};