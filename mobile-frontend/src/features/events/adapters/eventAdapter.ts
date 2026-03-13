import { EventEntity } from '@/core/types/event.types';
// import { EventDTO } from '../types/EventDTO';

/**
 * Formatuje datę ISO na polski format
 * "2024-07-20T22:00:00Z" → "20 lipca"
 */
export function formatPolishDate(isoDate: string): string {
  const date = new Date(isoDate);
  const months = [
    'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
    'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  return `${day} ${month}`;
}

/**
 * Ekstraktuje czas z daty ISO
 * "2024-07-20T22:00:00Z" → "22:00"
 */
export function extractTime(isoDate: string): string {
  const date = new Date(isoDate);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Generuje losowe współrzędne dla Gdańska (54.35-54.40, 18.60-18.65)
 * UWAGA: To tymczasowe rozwiązanie - docelowo backend powinien dostarczać coordinates
 */
export function generateGdanskCoordinates() {
  return {
    latitude: 54.35 + Math.random() * 0.05,
    longitude: 18.60 + Math.random() * 0.05,
  };
}

/**
 * Buduje pełny adres z obiektu AddressDTO
 */
export function buildFullAddress(address: any): string {
  if (address.raw_address_string) {
    return address.raw_address_string;
  }

  const parts = [
    address.street,
    address.city,
    address.postal_code,
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * Główny adapter: EventDTO → Event (frontend format)
 */
// export function adaptEventFromAPI(dto: EventDTO): Event {
//   return {
//     id: dto.id,
//     title: dto.name,
//     date: formatPolishDate(dto.start_date),
//     startTime: extractTime(dto.start_date),
//     endTime: extractTime(dto.end_date),
//     tags: dto.keywords || [],
//     address: buildFullAddress(dto.location.address),
//     going: 0,  // MOCK: Backend nie dostarcza liczby uczestników
//     coordinates: generateGdanskCoordinates(),  // MOCK: Backend nie dostarcza współrzędnych
//     type: dto.type || 'Event',
//     price: (dto.offer?.price && dto.offer.price > 0) ? 'paid' : 'free',
//     neighborhood: dto.location.address.city || undefined,
//     climate: dto.attendance_mode === 'online' ? 'indoor' : 'outdoor',
//   };
// }

/**
 * Adapter dla listy wydarzeń
 */
// export function adaptEventsFromAPI(dtos: EventDTO[]): Event[] {
//   return dtos.map(adaptEventFromAPI);
// }

/**
 * Adapter odwrotny: Event → EventDTO (do POST/PUT)
 * Używany przy tworzeniu/edycji wydarzeń
 */
// export function adaptEventToAPI(event: Partial<Event>): Partial<EventDTO> {
//   // TODO: Implementacja w przyszłości, jeśli będzie potrzeba tworzenia wydarzeń z frontendu
//   throw new Error('Not implemented yet');
// }
