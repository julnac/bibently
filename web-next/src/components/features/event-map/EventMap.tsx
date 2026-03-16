'use client';
import { Map } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import to prevent SSR — Leaflet requires `window`
const EventMapInner = dynamic(() => import('./EventMapInner'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-surface">
            <div className="text-center">
                <Map className='m-auto' />
                <p className="text-sm text-text-secondary">Ładowanie mapy...</p>
            </div>
        </div>
    ),
});

export default function EventMap() {
    return (
        <div className="w-full h-full">
            <EventMapInner />
        </div>
    );
}