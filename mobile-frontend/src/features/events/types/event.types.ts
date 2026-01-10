export interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  tags: string[];
  address: string;
  going: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: string; // Concert, Sport, Workshop, Party, Festival, Theater
  price: 'free' | 'paid';
  neighborhood?: string;
  climate?: 'indoor' | 'outdoor';
}
