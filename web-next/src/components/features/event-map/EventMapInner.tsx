'use client';

import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useSearchFilters } from '@/src/hooks/useSearchFilters';
import { useEvents } from '@/src/hooks/useEvents';
import EventMarker from './EventMarker';
import { useEffect } from 'react';
import type { EventEntity } from '@/src/types/event.types';

// Default center — Gdańsk
const DEFAULT_CENTER: [number, number] = [54.352, 18.6466];
const DEFAULT_ZOOM = 12;

/**
 * Map auto-fit to event bounds
 */
function MapBoundsUpdater({ events }: { events: EventEntity[] }) {
    const map = useMap();

    useEffect(() => {
        const coords = events
            .filter((e) => e.location?.address?.latitude && e.location?.address?.longitude)
            .map((e) => [e.location.address.latitude!, e.location.address.longitude!] as [number, number]);

        if (coords.length > 0) {
            const L = require('leaflet');
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        }
    }, [events, map]);

    return null;
}

export default function EventMapInner() {
    const { filters } = useSearchFilters();
    const { data: events } = useEvents(filters);
    const eventsWithCoords =
        events?.filter(
            (e: EventEntity) => e.location?.address?.latitude && e.location?.address?.longitude
        ) || [];

    return (
        <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            className="w-full h-full"
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {eventsWithCoords.length > 0 && <MapBoundsUpdater events={eventsWithCoords} />}
            {eventsWithCoords.map((event: EventEntity) => (
                <EventMarker key={event.id} event={event} />
            ))}
        </MapContainer>
    );
}
