import { EventSortableAccessor } from './event.types';
import { SortDirection } from './api.types';

export interface EventQueryParams {
  City?: string;
  Name?: string;
  StartDate?: string;
  EndDate?: string;
  MinPrice?: number | string;
  MaxPrice?: number | string;
  Type?: string;
  SortKey?: EventSortableAccessor;
  Order?: SortDirection;
  PageSize?: number | string;
  PageToken?: string;
}