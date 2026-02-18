'use client';

import { useSearchFilters } from '@/src/hooks/useSearchFilters';
import { useState } from 'react';

export default function SearchBar() {
    const { params, setCity, setName } = useSearchFilters();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className="relative flex items-center border border-border rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            style={{ background: 'white' }}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            {/* Segment: Where */}
            <div className="flex-1 px-5 py-2.5 border-r border-border-light">
                <p className="text-xs font-semibold text-text-primary">Gdzie</p>
                <input
                    type="text"
                    placeholder="Szukaj miasta"
                    className="text-sm text-text-secondary bg-transparent outline-none w-full placeholder:text-text-muted"
                    defaultValue={params.city || ''}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v) setCity(v);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const v = (e.target as HTMLInputElement).value.trim();
                            if (v) setCity(v);
                        }
                    }}
                />
            </div>

            {/* Segment: When */}
            <div className="hidden sm:block flex-1 px-5 py-2.5 border-r border-border-light">
                <p className="text-xs font-semibold text-text-primary">Kiedy</p>
                <p className="text-sm text-text-muted">Dodaj datę</p>
            </div>

            {/* Segment: What */}
            <div className="hidden md:block flex-1 px-5 py-2.5">
                <p className="text-xs font-semibold text-text-primary">Szukaj</p>
                <input
                    type="text"
                    placeholder="Nazwa wydarzenia"
                    className="text-sm text-text-secondary bg-transparent outline-none w-full placeholder:text-text-muted"
                    defaultValue={params.name || ''}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={(e) => {
                        const v = e.target.value.trim();
                        setName(v || null);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            const v = (e.target as HTMLInputElement).value.trim();
                            setName(v || null);
                        }
                    }}
                />
            </div>

            {/* Search Button */}
            <button
                className="m-2 w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white transition-transform hover:scale-105"
                style={{ background: 'var(--primary)' }}
                aria-label="Szukaj"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            </button>
        </div>
    );
}