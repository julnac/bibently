'use client';

import EventList from '@/src/components/features/event-list/EventList';
import EventMap from '@/src/components/features/event-map/EventMap';
import CategoryBar from '@/src/components/features/filters/category/CategoryBar';
import { useViewStore } from '@/src/store/useViewStore';
import { Map, List } from 'lucide-react';
import { Suspense } from 'react';

export default function HomeContent() {
    const { viewMode, toggleViewMode } = useViewStore();

    return (
        <div className="flex w-full h-full overflow-hidden bg-surface relative">
            {/* ── Map (right side, desktop only — always visible) ── */}
            <section className="hidden md:flex flex-col flex-1 bg-surface-hover relative shrink-0 z-1">
                <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-auto">
                    <Suspense fallback={<div className="h-[70px]" />}>
                        <CategoryBar />
                    </Suspense>
                </div>
                <div className="flex-1 relative">
                    <EventMap />
                </div>
            </section>

            {/* ── Event List (left side on desktop, full on mobile) ── */}
            <section
                className={`
                    md:w-[600px] md:2xl:w-[660px] overflow-y-auto custom-scrollbar p-4 md:p-5 bg-surface-hover shadow-xl z-10
                    ${viewMode === 'map' ? 'hidden md:block' : 'w-full'}
                `}
            >
                {/* Mobile Category Bar (above event list) */}
                <div className="md:hidden mb-4 sticky top-0 z-10">
                    <Suspense fallback={<div className="h-[70px]" />}>
                        <CategoryBar />
                    </Suspense>
                </div>

                <div className="max-w-[660px] mx-auto xl:mx-0">
                    <EventList />
                </div>
            </section>

            {/* ── Mobile Map (full screen when map mode) ── */}
            {viewMode === 'map' && (
                <section className="md:hidden absolute inset-0 z-[5]">
                    <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-auto">
                        <Suspense fallback={<div className="h-[70px]" />}>
                            <CategoryBar />
                        </Suspense>
                    </div>
                    <EventMap />
                </section>
            )}

            {/* ── Floating View Toggle Button (Airbnb-style, mobile/tablet only) ── */}
            <button
                onClick={toggleViewMode}
                className="
                    md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]
                    flex items-center gap-2 px-5 py-3
                    bg-foreground text-white
                    rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.25)]
                    hover:bg-foreground/90 active:scale-95
                    transition-all duration-200
                    text-sm font-semibold
                "
                aria-label={viewMode === 'list' ? 'Show map' : 'Show list'}
            >
                {viewMode === 'list' ? (
                    <>
                        <Map size={16} />
                        <span>Map</span>
                    </>
                ) : (
                    <>
                        <List size={16} />
                        <span>List</span>
                    </>
                )}
            </button>
        </div>
    );
}
