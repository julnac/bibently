'use client';

import Filters from '@/src/components/features/filters/Filters';
import EventList from '@/src/components/features/event-list/EventList';
import EventMap from '@/src/components/features/event-map/EventMap';

export default function HomeContent() {
    return (
        <div className="flex h-full overflow-hidden">
            {/* ── Sidebar Filters (desktop only) ── */}
            <aside className="hidden lg:flex flex-col w-[280px] border-r border-border overflow-y-auto custom-scrollbar p-5 shrink-0">
                <Filters />
            </aside>

            {/* ── Event List (center) ── */}
            <section className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-5">
                    <div className="mb-5 flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold text-text-primary">
                                Wydarzenia w Twojej okolicy
                            </h1>
                            <p className="text-sm text-text-secondary mt-1">
                                Odkryj najlepsze eventy blisko Ciebie
                            </p>
                        </div>
                        <button className="lg:hidden flex items-center gap-2 bg-foreground text-white px-4 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="4" y1="6" x2="20" y2="6" />
                                <line x1="4" y1="12" x2="16" y2="12" />
                                <line x1="4" y1="18" x2="12" y2="18" />
                            </svg>
                            Filtry
                        </button>
                    </div>
                    <EventList />
                </div>
            </section>

            {/* ── Map (right side, desktop) ── */}
            <section className="hidden md:block w-[40%] lg:w-[45%] relative shrink-0">
                <EventMap />
            </section>
        </div>
    );
}
