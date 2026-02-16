import { EventSortableAccessor } from './event.types';
import { SortDirection } from './api.types';

export interface EventQueryParams {
  City?: string;
  Name?: string;
  StartDate?: string;
  EndDate?: string;
  MinPrice?: number;
  MaxPrice?: number;
  Type?: string;
  Keywords?: string[];
  SortKey?: EventSortableAccessor;
  Order?: SortDirection;
  PageSize?: number | string;
  PageToken?: string;
}