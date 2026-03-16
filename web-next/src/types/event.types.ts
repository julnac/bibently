import { Location, Organization } from './common.types';

export type EventSortableAccessor = 'StartDate' | 'CreatedAt' | 'Name' | 'DatePublished' | 'Price' | null;

export interface Offer {
  type: string;
  price: number;
  currency: string;
  url: string;
  isAvailable: boolean;
  statusText?: string | null;
  availabilityType?: string | null;
}

export interface EventEntity {
  id: string; // uuid
  category: string;
  name: string;
  description: string;
  articleBody?: string | null;
  keywords?: string[];
  startDate: string; // date-time
  endDate?: string | null;
  datePublished: string;
  url: string;
  imageUrl?: string | null;
  eventStatus: string;
  attendanceMode: string;
  location: Location;
  performer: Organization;
  organizer?: Organization | null;
  offer: Offer;
  provider: string;
  createdAt: string;
}

export interface EventSummary {
  id: string;
  category: string;
  name: string;
  keywords?: string[];
  startDate: string;
  endDate?: string;
  imageUrl?: string;
  eventStatus: string;
  attendanceMode: string;
  location: Location;
  price: number;
  currency: string;
  attendeeCount: number;
}

export interface CreateEventRequest {
  category: string;
  name: string;
  description: string;
  articleBody?: string | null;
  keywords?: string[];
  startDate: string; // date-time
  endDate?: string | null;
  datePublished: string;
  url: string;
  imageUrl?: string | null;
  eventStatus: string;
  attendanceMode: string;
  location: Location;
  performer: Organization;
  organizer?: Organization | null;
  offer: Offer;
  provider: string;
}
