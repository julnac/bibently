import { EventSummary } from './event.types';

export type SortDirection = 'Ascending' | 'Descending' | null;

export interface ApiPaginationResponse {
  items?: EventSummary[] | null;
  nextPageToken?: string | null;
  totalCount?: number | null;
}