import { useQuery } from '@tanstack/react-query';
import { eventService } from '../services/events.service';
import { EventEntity } from '../types/event.types';

export const useEvent = (id: string | undefined) => {
  return useQuery<EventEntity, Error>({
    queryKey: ['event', id],
    queryFn: () => eventService.getEventById(id!),
    enabled: !!id,
  });
};