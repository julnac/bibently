import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { eventService } from '../services/events.service';
import { EventQueryParams } from '../types/event.params';
import { EventEntity } from '../types/event.types';
import { ApiPaginationResponse } from '../types/api.types';

export const useEvents = (filters: EventQueryParams) => {
  return useInfiniteQuery<
    ApiPaginationResponse,
    Error,
    EventEntity[],
    [string, EventQueryParams],
    string | undefined
  >({
    queryKey: ['events', filters],
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      eventService.getEvents({
        ...filters,
        PageToken: pageParam,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage: ApiPaginationResponse) => {
      return lastPage.nextPageToken || undefined;
    },
    select: (data: InfiniteData<ApiPaginationResponse, string | undefined>) =>
      data.pages.flatMap((pageParam: ApiPaginationResponse) => pageParam.items || []),
  });
};