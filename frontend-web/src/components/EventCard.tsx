import type { Event } from '../types.ts';
import { HeartIcon, StarIcon } from './icons.tsx';

interface EventCardProps {
  event: Event;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export const EventCard = ({ event, isFavorite, onToggleFavorite }: EventCardProps) => {
  const { id, name, imageUrl, address, city, date, time, eventType, ticketPrice, rating, reviews, description } = event;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl flex flex-col">
      <div className="relative">
        <img src={imageUrl} alt={name} className="w-full h-48 object-cover" />
        <button
          onClick={() => onToggleFavorite(id)}
          className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 transition-colors hover:bg-white"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <HeartIcon className={`w-6 h-6 ${isFavorite ? 'text-red-500' : 'text-gray-700'}`} filled={isFavorite} />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 truncate">{name}</h3>
        <p className="text-sm text-gray-500 mt-1">{address}, {city}</p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-medium text-blue-600">{eventType}</span>
          <span className="font-medium text-gray-700">{date} {time}</span>
        </div>
        <div className="mt-2 text-sm text-gray-700 line-clamp-2">{description}</div>
        <div className="mt-auto pt-4 flex items-center justify-between text-sm">
          <div className="flex items-center">
            <StarIcon className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-800 font-bold ml-1">{rating.toFixed(1)}</span>
            <span className="text-gray-500 ml-2">({reviews} reviews)</span>
          </div>
          <span className="font-semibold text-green-700">{ticketPrice === 0 ? 'Free' : `£${ticketPrice}`}</span>
        </div>
      </div>
    </div>
  );
};
