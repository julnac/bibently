import type { Event } from '../types.ts';

export const mockEvents: Event[] = [
  {
    id: '1',
    name: 'London Jazz Festival',
    categories: ['Music', 'Jazz'],
    address: 'Royal Albert Hall, Kensington Gore',
    city: 'London',
    country: 'UK',
    date: '2025-11-20',
    time: '19:30',
    eventType: 'Concert',
    ticketPrice: 45,
    rating: 4.8,
    reviews: 320,
    ageRestriction: 'All ages',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=60',
    description: 'Experience world-class jazz performances at the iconic Royal Albert Hall.'
  },
  {
    id: '2',
    name: 'Tech Innovators Meetup',
    categories: ['Technology', 'Networking'],
    address: 'TechHub, 123 Silicon Ave',
    city: 'London',
    country: 'UK',
    date: '2025-11-22',
    time: '18:00',
    eventType: 'Meetup',
    ticketPrice: 0,
    rating: 4.6,
    reviews: 110,
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=60',
    description: 'Connect with tech enthusiasts and industry leaders. Free entry!'
  },
  {
    id: '3',
    name: 'Bristol Art Fair',
    categories: ['Art', 'Exhibition'],
    address: 'Bristol Art Gallery, 45 Art St',
    city: 'Bristol',
    country: 'UK',
    date: '2025-12-01',
    time: '10:00',
    eventType: 'Exhibition',
    ticketPrice: 12,
    rating: 4.7,
    reviews: 210,
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=60',
    description: 'Discover contemporary art from local and international artists.'
  },
  {
    id: '4',
    name: 'Manchester Food Festival',
    categories: ['Food', 'Festival'],
    address: 'Central Park, 99 Main Rd',
    city: 'Manchester',
    country: 'UK',
    date: '2025-11-28',
    time: '12:00',
    eventType: 'Festival',
    ticketPrice: 8,
    rating: 4.5,
    reviews: 400,
    imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=60',
    description: 'Taste the best street food and local delicacies. Fun for all ages!'
  },
  {
    id: '5',
    name: 'Yoga in the Park',
    categories: ['Health', 'Wellness'],
    address: 'Hyde Park, Serpentine Rd',
    city: 'London',
    country: 'UK',
    date: '2025-11-18',
    time: '09:00',
    eventType: 'Workshop',
    ticketPrice: 5,
    rating: 4.9,
    reviews: 95,
    imageUrl: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=60',
    description: 'Start your day with a relaxing yoga session in the park.'
  },
  {
    id: '6',
    name: 'Coding Bootcamp',
    categories: ['Education', 'Technology'],
    address: 'CodeSpace, 77 Dev St',
    city: 'Manchester',
    country: 'UK',
    date: '2025-12-05',
    time: '09:00',
    eventType: 'Workshop',
    ticketPrice: 99,
    rating: 4.8,
    reviews: 180,
    ageRestriction: '16+',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=60',
    description: 'Intensive one-day coding bootcamp for beginners and intermediates.'
  },
  {
    id: '7',
    name: 'Winter Wonderland',
    categories: ['Festival', 'Family'],
    address: 'City Square, 1 Main St',
    city: 'Bristol',
    country: 'UK',
    date: '2025-12-15',
    time: '16:00',
    eventType: 'Festival',
    ticketPrice: 15,
    rating: 4.7,
    reviews: 250,
    imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=60',
    description: 'Festive fun for the whole family with rides, food, and entertainment.'
  },
  {
    id: '8',
    name: 'Startup Pitch Night',
    categories: ['Business', 'Networking'],
    address: 'Innovation Hub, 12 Startup Rd',
    city: 'London',
    country: 'UK',
    date: '2025-11-25',
    time: '18:30',
    eventType: 'Meetup',
    ticketPrice: 0,
    rating: 4.4,
    reviews: 60,
    imageUrl: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b41?auto=format&fit=crop&w=800&q=60',
    description: 'Watch startups pitch their ideas to investors and network with entrepreneurs.'
  },
  {
    id: '9',
    name: 'Charity Fun Run',
    categories: ['Sports', 'Charity'],
    address: 'Riverside Park, 5 River Ln',
    city: 'Manchester',
    country: 'UK',
    date: '2025-11-30',
    time: '10:00',
    eventType: 'Sports',
    ticketPrice: 10,
    rating: 4.6,
    reviews: 180,
    imageUrl: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=800&q=60',
    description: 'Join the annual charity run and support a good cause.'
  },
  {
    id: '10',
    name: 'French Film Night',
    categories: ['Film', 'Culture'],
    address: 'Cinema Lumière, 22 Movie Blvd',
    city: 'Bristol',
    country: 'UK',
    date: '2025-12-10',
    time: '20:00',
    eventType: 'Screening',
    ticketPrice: 9,
    rating: 4.9,
    reviews: 140,
    imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=60',
    description: 'Enjoy a classic French film with English subtitles.'
  }
];

// For pagination demonstration, duplicate events with new IDs
for (let i = 0; i < 5; i++) {
  mockEvents.forEach(e => {
    const newId = `${e.id}_${i + 1}`;
    if (!mockEvents.find(ev => ev.id === newId)) {
      mockEvents.push({ ...e, id: newId, name: `${e.name} #${i + 1}` });
    }
  });
}
