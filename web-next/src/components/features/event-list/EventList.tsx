'use client';

import { useSearchFilters } from '@/src/hooks/useSearchFilters';
import { useEvents } from '@/src/hooks/useEvents';
import { useMapInteractionStore } from '@/src/store/useMapInteractionStore';
import { useMapBoundsStore } from '@/src/store/useMapBoundsStore';
import EventCard from './EventCard';
import { EventSummary } from '@/src/types/event.types';
import { ArrowDownUpIcon, SearchAlert } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

type SortOption = { label: string; key: string; direction: 'Ascending' | 'Descending' };
const SORT_OPTIONS: SortOption[] = [
    { label: 'the closest date', key: 'StartDate', direction: 'Ascending' },
    { label: 'price ascending', key: 'Price', direction: 'Ascending' },
    // { label: 'price descending', key: 'Price', direction: 'Descending' },
    { label: 'name ascending', key: 'Name', direction: 'Ascending' },
    { label: 'the newest', key: 'DatePublished', direction: 'Descending' },
    // { label: 'attendance', key: 'Attendance', direction: 'Descending' },
    // { label: 'distance', key: 'Distance', direction: 'Ascending' },
];

export default function EventList() {
    const { filters, params, setSorting } = useSearchFilters();
    const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useEvents(filters);
    let events = data?.items || [];
    let totalCount = data?.totalCount ?? 0;
    const { hoveredEventId, setHoveredEventId } = useMapInteractionStore();
    const { isMapFilteringEnabled, setIsMapFilteringEnabled, mapBounds, isMapMoving } = useMapBoundsStore();

    if (isMapFilteringEnabled && mapBounds) {
        events = events.filter((event) => {
            if (!event.location?.address?.latitude || !event.location?.address?.longitude) return false;
            const lat = event.location.address.latitude;
            const lng = event.location.address.longitude;
            return (
                lat >= mapBounds.southWest.lat &&
                lat <= mapBounds.northEast.lat &&
                lng >= mapBounds.southWest.lng &&
                lng <= mapBounds.northEast.lng
            );
        });
        totalCount = events.length;
    }

    // Sort popover
    const [showSort, setShowSort] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);
    const currentSortKey = params.sortKey || 'StartDate';
    const currentSortDir = params.order || 'Ascending';
    const activeLabel = SORT_OPTIONS.find(o => o.key === currentSortKey && o.direction === currentSortDir)?.label || 'the closest date';

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (showSort && sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setShowSort(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showSort]);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-center bg-surface rounded-[8px] gap-0 sm:gap-4 relative shadow-[0_4px_12px_rgba(0,0,0,0.05)] w-full">
                        {/* Image Skeleton */}
                        <div className="shrink-0 w-full sm:w-[200px] h-[180px] sm:h-[150px] rounded-t-[8px] sm:rounded-t-none sm:rounded-l-[8px] skeleton" />

                        {/* Content Skeleton */}
                        <div className="flex flex-col flex-1 p-3 sm:p-0 sm:h-[130px] justify-between sm:pr-12 sm:py-1">
                            <div className="space-y-3">
                                <div className="skeleton h-5 w-3/4 rounded" />
                                <div className="skeleton h-4 w-1/3 rounded" />
                                <div className="skeleton h-4 w-1/2 rounded" />
                            </div>
                            <div className="flex items-center justify-between mt-3 sm:mt-0">
                                <div className="skeleton h-4 w-1/4 rounded" />
                                <div className="skeleton h-8 w-16 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <SearchAlert />
                <h3 className="text-lg font-semibold text-text-primary mb-1">Coś poszło nie tak</h3>
                <p className="text-sm text-text-secondary">{error?.message || 'Nie udało się pobrać wydarzeń'}</p>
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <SearchAlert />
                <h3 className="text-lg font-semibold text-text-primary mb-1">Brak wyników</h3>
                <p className="text-sm text-text-secondary">Spróbuj zmienić filtry lub wyszukaj w innym mieście</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full">
            {/* Header */}
            <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 pb-2 gap-3">
                <span className="text-xs font-medium text-text-primary">
                    {totalCount} events found
                </span>

                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    {/* Map bounds switch (hidden on mobile — map is toggled separately) */}
                    <div className="hidden md:flex items-center gap-2 bg-surface px-3 py-1.5 rounded-full border border-border">
                        <span className="text-xs text-text-secondary">Przeszukuj widoczny obszar</span>
                        <button
                            className={`w-8 h-4 rounded-full transition-colors relative ${isMapFilteringEnabled ? 'bg-primary' : 'bg-border'}`}
                            onClick={() => setIsMapFilteringEnabled(!isMapFilteringEnabled)}
                        >
                            <div className={`w-3 h-3 rounded-full bg-white absolute top-[2px] transition-all ${isMapFilteringEnabled ? 'left-[18px]' : 'left-[2px]'}`}></div>
                        </button>
                    </div>

                    <div className="relative" ref={sortRef}>
                        <button
                            className={`flex items-center gap-2 h-8 px-4 rounded-full text-xs text-text-primary transition-all border ${showSort
                                ? 'bg-white border-border shadow-md'
                                : 'bg-surface hover:bg-surface-hover border-border'
                                }`}
                            onClick={() => setShowSort(!showSort)}
                        >
                            <ArrowDownUpIcon width={12} />
                            {activeLabel}
                        </button>

                        {showSort && (
                            <div className="absolute top-10 right-0 w-[200px] bg-white rounded-[8px] shadow-[0_8px_28px_rgba(0,0,0,0.12)] border border-border p-5 z-[50]">
                                <div className="text-xs text-text-secondary font-medium mb-4">Sort by</div>
                                <div className="flex flex-col gap-2">
                                    {SORT_OPTIONS.map((opt) => {
                                        const isActive = currentSortKey === opt.key && currentSortDir === opt.direction;
                                        return (
                                            <button
                                                key={opt.key}
                                                className={`px-4 py-2 rounded-full text-xs transition-all border ${isActive
                                                    ? 'bg-foreground text-white border-foreground'
                                                    : 'bg-white text-text-primary border-border hover:border-text-secondary'
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSorting(opt.key as any, opt.direction);
                                                    setShowSort(false);
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={`flex flex-col gap-3 transition-opacity duration-200 ${(isMapFilteringEnabled && isMapMoving) ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {events?.map((event: EventSummary) => (
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
                        className="px-6 py-2.5 rounded-full border border-border text-text-primary text-xs hover:bg-foreground hover:text-surface transition-colors disabled:opacity-50"
                    >
                        {isFetchingNextPage ? 'Loading...' : 'Show more'}
                    </button>
                </div>
            )}
        </div>
    );
}
