'use client';

import { useSearchFilters } from '@/src/hooks/useSearchFilters';
import { useEvents } from '@/src/hooks/useEvents';
import { useMapInteractionStore } from '@/src/store/useMapInteractionStore';
import EventCard from './EventCard';
import { EventEntity } from '@/src/types/event.types';

export default function EventList() {
    const { filters } = useSearchFilters();
    const { data: events, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useEvents(filters);
    const { hoveredEventId, setHoveredEventId } = useMapInteractionStore();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-xl overflow-hidden">
                        <div className="skeleton aspect-[16/10] w-full rounded-xl" />
                        <div className="pt-3 space-y-2">
                            <div className="skeleton h-4 w-3/4" />
                            <div className="skeleton h-3 w-1/2" />
                            <div className="skeleton h-3 w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-4">😔</div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Coś poszło nie tak</h3>
                <p className="text-sm text-text-secondary">{error?.message || 'Nie udało się pobrać wydarzeń'}</p>
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-text-primary mb-1">Brak wyników</h3>
                <p className="text-sm text-text-secondary">Spróbuj zmienić filtry lub wyszukaj w innym mieście</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {events.map((event: EventEntity) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        isHovered={hoveredEventId === event.id}
                        onMouseEnter={() => setHoveredEventId(event.id)}
                        onMouseLeave={() => setHoveredEventId(null)}
                    />
                ))}
            </div>

            {/* ── Load More ── */}
            {hasNextPage && (
                <div className="flex justify-center mt-8 mb-4">
                    <button
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="px-6 py-2.5 rounded-full border border-foreground text-foreground text-sm font-semibold hover:bg-foreground hover:text-white transition-colors disabled:opacity-50"
                    >
                        {isFetchingNextPage ? 'Ładowanie...' : 'Pokaż więcej'}
                    </button>
                </div>
            )}
        </>
    );
}