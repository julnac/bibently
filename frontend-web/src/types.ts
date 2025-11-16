export interface Event {
  id: string;
  name: string;
  categories: string[]; // e.g., ['Music', 'Art', 'Sports']
  address: string;
  city: string;
  country: string;
  date: string; // ISO date string, e.g., '2025-11-14'
  time: string; // e.g., '19:00'
  eventType: string; // e.g., 'Concert', 'Workshop', 'Festival'
  ticketPrice: number; // in local currency
  rating: number;
  reviews: number;
  ageRestriction?: string; // e.g., '18+', 'All ages'
  imageUrl: string;
  description: string;
}

export interface Filters {
  categories: string[];
  date?: string; // filter by date
  city?: string;
  maxTicketPrice?: number;
  minRating?: number;
  eventType?: string;
}

export type SortBy = 'relevance' | 'rating' | 'price_asc' | 'price_desc' | 'date_asc' | 'date_desc';
