import { useInfiniteQuery } from '@tanstack/react-query';
import { eventService } from '../services/events.service';
import { EventQueryParams } from '../types/event.params';
import { EventEntity } from '../types/event.types';
import { ApiPaginationResponse } from '../types/api.types';

export const useEvents = (filters: EventQueryParams) => {
  return useInfiniteQuery<
    ApiPaginationResponse, // Typ danych z pojedynczej strony API
    Error,                 // Typ błędu
    EventEntity[],         // Typ po transformacji (select)
    [string, EventQueryParams], // Typ klucza zapytania
    string | undefined     // TYP NASZEGO TOKENA (PageParam) - to rozwiązuje błąd
  >({
    queryKey: ['events', filters],
    queryFn: ({ pageParam }) => 
      eventService.getEvents({ 
        ...filters, 
        PageToken: pageParam 
      }),
    initialPageParam: undefined, 
    getNextPageParam: (lastPage) => {
      return lastPage.nextPageToken || undefined;
    },
    select: (data) => data.pages.flatMap((page) => page.items || []),
  });
};