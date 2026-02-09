import { EventEntity } from './event.types';

export type SortDirection = 'Ascending' | 'Descending' | null;

export interface ApiPaginationResponse {
  items?: EventEntity[] | null;
  nextPageToken?: string | null;
}