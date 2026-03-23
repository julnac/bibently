'use client';

import { MapContainer, TileLayer, useMap, Marker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useSearchFilters } from '@/src/hooks/useSearchFilters';
import { useEvents } from '@/src/hooks/useEvents';
import EventMarker from './EventMarker';
import { useEffect, useMemo } from 'react';
import type { EventSummary } from '@/src/types/event.types';
import { useMapBoundsStore } from '@/src/store/useMapBoundsStore';

const DEFAULT_CENTER: [number, number] = [54.352, 18.6466];
const DEFAULT_ZOOM = 12;

function MapBoundsTracker() {
    const setMapBounds = useMapBoundsStore((state) => state.setMapBounds);
    const setIsMapMoving = useMapBoundsStore((state) => state.setIsMapMoving);

    const map = useMapEvents({
        dragstart: () => setIsMapMoving(true),
        zoomstart: () => setIsMapMoving(true),
        moveend: () => {
            const bounds = map.getBounds();
            setMapBounds({
                northEast: { lat: bounds.getNorthEast().lat, lng: bounds.getNorthEast().lng },
                southWest: { lat: bounds.getSouthWest().lat, lng: bounds.getSouthWest().lng }
            });
            setIsMapMoving(false);
        },
    });

    useEffect(() => {
        if (map) {
            const bounds = map.getBounds();
            setMapBounds({
                northEast: { lat: bounds.getNorthEast().lat, lng: bounds.getNorthEast().lng },
                southWest: { lat: bounds.getSouthWest().lat, lng: bounds.getSouthWest().lng }
            });
        }
    }, [map, setMapBounds]);

    return null;
}

function MapBoundsUpdater({ events, centerFilter, radiusKm }: { events: EventSummary[], centerFilter?: [number, number], radiusKm?: number }) {
    const map = useMap();

    useEffect(() => {
        let allCoords: [number, number][] = events
            .filter((e) => e.location?.address?.latitude && e.location?.address?.longitude)
            .map((e) => [e.location.address.latitude!, e.location.address.longitude!] as [number, number]);

        const L = require('leaflet');
        const bounds = L.latLngBounds(allCoords);

        if (centerFilter && radiusKm) {
            // Include circle bounds as well
            const centerLatLng = L.latLng(centerFilter[0], centerFilter[1]);
            const circleBounds = centerLatLng.toBounds(radiusKm * 1000 * 2); // multiplied by 2 to get bounding box roughly
            bounds.extend(circleBounds);
        }

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
        }
    }, [events, map, centerFilter, radiusKm]);

    return null;
}

export default function EventMapInner() {
    const { filters } = useSearchFilters();
    const { data } = useEvents(filters);
    const events = data?.items;
    const eventsWithCoords = useMemo(() => 
        events?.filter(
            (e: EventSummary) => e.location?.address?.latitude && e.location?.address?.longitude
        ) || [],
    [events]);

    const isMapFilteringEnabled = useMapBoundsStore((state) => state.isMapFilteringEnabled);

    const hasLocationFilter = filters.latitude != null && filters.longitude != null && filters.radiusKm != null;
    const centerFilter: [number, number] | undefined = hasLocationFilter ? [filters.latitude as number, filters.longitude as number] : undefined;

    const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div class="w-6 h-6 rounded-full border-[2px] border-primary flex items-center justify-center bg-background shadow-sm"/>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });

    return (
        <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            className="w-full h-full"
            zoomControl={false}
        >
            <MapBoundsTracker />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {hasLocationFilter && centerFilter && (
                <>
                    <Circle
                        center={centerFilter}
                        radius={filters.radiusKm! * 1000}
                        pathOptions={{ color: '#CA7037', fillColor: '#CA7037', fillOpacity: 0, weight: 2, dashArray: '4, 8' }}
                    />
                    <Marker
                        position={centerFilter}
                        icon={userIcon}
                    />
                </>
            )}
            {(eventsWithCoords.length > 0 || hasLocationFilter) && !isMapFilteringEnabled && (
                <MapBoundsUpdater
                    events={eventsWithCoords}
                    centerFilter={centerFilter}
                    radiusKm={filters.radiusKm}
                />
            )}
            {eventsWithCoords.map((event: EventSummary) => (
                <EventMarker key={event.id} event={event} />
            ))}
        </MapContainer>
    );
}
