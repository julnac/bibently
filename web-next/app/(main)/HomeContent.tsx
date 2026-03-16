'use client';

import EventList from '@/src/components/features/event-list/EventList';
import EventMap from '@/src/components/features/event-map/EventMap';
import CategoryBar from '@/src/components/features/filters/category/CategoryBar';
import { Suspense } from 'react';

export default function HomeContent() {
    return (
        <div className="flex w-full h-full overflow-hidden bg-surface">
            {/* ── Event List (left) ── */}
            <section className="w-[740px] overflow-y-auto custom-scrollbar p-5 bg-surface-hover shadow-xl z-10">
                <div className="max-w-[720px] mx-auto xl:mx-0">
                    <EventList />
                </div>
            </section>

            {/* ── Map (right side, desktop) ── */}
            <section className="hidden md:flex flex-col flex-1 bg-surface-hover relative shrink-0 z-1">
                <div className="absolute top-0 left-0 right-0 z-[1000] pointer-events-auto">
                    <Suspense fallback={<div className="h-[70px]" />}>
                        <CategoryBar />
                    </Suspense>
                </div>
                <div className="flex-1 relative">
                    <EventMap />
                </div>
            </section>
        </div>
    );
}
