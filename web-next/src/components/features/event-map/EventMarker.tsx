'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMapInteractionStore } from '@/src/store/useMapInteractionStore';
import { EventSummary } from '@/src/types/event.types';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { MapPin, Calendar } from 'lucide-react';

import { renderToStaticMarkup } from 'react-dom/server';
import { getCategoryIcon } from '@/src/utils/categoryIcons';
import { useCategories } from '@/src/store/useCategories';

interface EventMarkerProps {
    event: EventSummary;
}

export default function EventMarker({ event }: EventMarkerProps) {
    const { hoveredEventId, setHoveredEventId } = useMapInteractionStore();
    const isHovered = hoveredEventId === event.id;
    const { data: categories } = useCategories();

    const lat = event.location?.address?.latitude;
    const lng = event.location?.address?.longitude;

    if (!lat || !lng) return null;

    const categoryString = categories?.find((c) => c.value === event.category)?.translationKey;
    const categoryKey = categoryString?.split('.')[1] || 'event';

    const IconComponent = getCategoryIcon(categoryKey);
    const iconHtml = renderToStaticMarkup(
        <IconComponent
            size={18}
        />
    );

    const formattedDate = format(new Date(event.startDate), 'd MMM, HH:mm', { locale: pl });

    return (
        <Marker
            position={[lat, lng]}
            icon={L.divIcon({
                className: 'custom-marker',
                html: `<div class="event-marker ${isHovered ? 'event-marker--active' : ''} flex items-center justify-center rounded-full shadow-md" style="width: 32px; height: 32px;">
                    ${iconHtml}
                </div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
            })}
            eventHandlers={{
                mouseover: () => setHoveredEventId(event.id),
                mouseout: () => setHoveredEventId(null),
            }}
        >
            <Popup className="event-popup" closeButton={false}>
                <div className="w-[240px] overflow-hidden rounded-lg">
                    {/* ── Image Header ── */}
                    <div className="relative h-28 bg-surface">
                        {event.imageUrl ? (
                            <img
                                src={event.imageUrl}
                                alt={event.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 text-2xl">
                                🎉
                            </div>
                        )}

                        {/* Price Badge */}
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-xs font-bold bg-white/90 text-text-primary shadow-sm backdrop-blur-sm">
                            {event.price === 0 ? 'Free' : `${event.price} zł`}
                        </div>
                    </div>

                    {/* ── Content ── */}
                    <div className="p-3 bg-white">
                        <h3 className="font-bold text-sm text-text-primary line-clamp-2 leading-snug mb-2">
                            {event.name}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-1">
                            <Calendar size={12} />
                            <span className="capitalize">{formattedDate}</span>
                        </div>

                        <div className="flex items-start gap-1.5 text-xs text-text-secondary">
                            <MapPin size={12} className="shrink-0 mt-0.5" />
                            <span className="line-clamp-1">
                                {event.location?.name || event.location?.address?.city}
                            </span>
                        </div>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}
