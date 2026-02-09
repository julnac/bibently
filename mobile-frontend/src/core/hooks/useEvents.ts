import { useState, useEffect, useCallback } from 'react';
import { eventService } from '../services/events.service';
import { EventEntity } from '../types/event.types';
import { EventQueryParams } from '../types/event.params';

export const useEvents = (initialParams?: EventQueryParams) => {
  const [events, setEvents] = useState<EventEntity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);

  const fetchEvents = useCallback(async (params?: EventQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getEvents(params);
      
      setEvents(data.items || []);
      setNextToken(data.nextPageToken || null);
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas pobierania wydarzeń');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = async () => {
    if (loadingMore || !nextToken) return;

    try {
      setLoadingMore(true);
      const data = await eventService.getEvents({
        ...initialParams,
        PageToken: nextToken // Wysyłamy token otrzymany z poprzedniego zapytania
      });

      if (data.items) {
        setEvents(prev => [...prev, ...data.items!]); // Doklejamy nowe elementy
      }
      setNextToken(data.nextPageToken || null);
    } catch (err) {
      console.error("Błąd podczas ładowania kolejnej strony:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchEvents(initialParams);
  }, [fetchEvents]);

  return { events, loading, loadMore, error, nextToken, refresh: () => fetchEvents(initialParams) };
};