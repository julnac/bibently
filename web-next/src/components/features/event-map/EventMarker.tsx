'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMapInteractionStore } from '@/src/store/useMapInteractionStore';
import { EventEntity } from '@/src/types/event.types';

interface EventMarkerProps {
    event: EventEntity;
}

function createMarkerIcon(price: string, isHovered: boolean): L.DivIcon {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div class="event-marker ${isHovered ? 'event-marker--active' : ''}">${price}</div>`,
        iconSize: [0, 0],    // actual size controlled by CSS
        iconAnchor: [0, 0],
    });
}

export default function EventMarker({ event }: EventMarkerProps) {
    const { hoveredEventId, setHoveredEventId } = useMapInteractionStore();
    const isHovered = hoveredEventId === event.id;

    const lat = event.location?.address?.latitude;
    const lng = event.location?.address?.longitude;

    if (!lat || !lng) return null;

    const priceLabel =
        event.offer?.price === 0
            ? 'Free'
            : event.offer?.price
                ? `${event.offer.price} zł`
                : '•';

    const icon = createMarkerIcon(priceLabel, isHovered);

    return (
        <Marker
            position={[lat, lng]}
            icon={icon}
            eventHandlers={{
                mouseover: () => setHoveredEventId(event.id),
                mouseout: () => setHoveredEventId(null),
            }}
        >
            <Popup>
                <div className="min-w-[180px]">
                    <h4 className="font-semibold text-sm mb-1">{event.name}</h4>
                    <p className="text-xs text-gray-500">{event.location?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(event.startDate).toLocaleDateString('pl-PL', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </p>
                    {event.offer?.price !== undefined && (
                        <p className="text-sm font-semibold mt-1.5">{priceLabel}</p>
                    )}
                </div>
            </Popup>
        </Marker>
    );
}
