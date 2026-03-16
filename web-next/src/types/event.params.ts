import { EventSortableAccessor } from './event.types';
import { SortDirection } from './api.types';

export interface EventQueryParams {
  city?: string;
  name?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  keywords?: string[];
  latitude?: number | string;
  longitude?: number | string;
  radiusKm?: number;
  sortKey?: EventSortableAccessor;
  order?: SortDirection;
  pageSize?: number | string;
  pageToken?: string;
} 