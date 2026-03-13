import { EventSortableAccessor } from './event.types';
import { SortDirection } from './api.types';

export interface EventQueryParams {
  City?: string;
  Name?: string;
  StartDate?: string;
  EndDate?: string;
  MinPrice?: number;
  MaxPrice?: number;
  Category?: string;
  Latitude?: number | string;
  Longitude?: number | string;
  RadiusKm?: number;
  Keywords?: string[];
  SortKey?: EventSortableAccessor;
  Order?: SortDirection;
  PageSize?: number | string;
  PageToken?: string;
}