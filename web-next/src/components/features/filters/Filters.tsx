'use client';

import { useSearchFilters } from '@/src/hooks/useSearchFilters';
import { EventSortableAccessor } from '@/src/types/event.types';
import { SortDirection } from '@/src/types/api.types';

export default function Filters() {
    const { params, setPriceRange, resetAll, setSorting } = useSearchFilters();

    return (
        <div className="space-y-6">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-primary">Filtry</h2>
                <button
                    onClick={resetAll}
                    className="text-sm font-medium underline hover:no-underline transition-all"
                    style={{ color: 'var(--primary)' }}
                >
                    Wyczyść
                </button>
            </div>

            {/* ── Price Range ── */}
            <div>
                <label className="block text-sm font-semibold text-text-primary mb-3">
                    Cena
                </label>

                {/* Quick price presets */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {[
                        { label: 'Za darmo', min: 0, max: 0 },
                        { label: 'Do 50 zł', min: null, max: 50 },
                        { label: 'Do 100 zł', min: null, max: 100 },
                        { label: 'Do 200 zł', min: null, max: 200 },
                        { label: 'Dowolna cena', min: null, max: null }
                    ].map((preset) => {
                        const isActive =
                            params.minPrice === preset.min && params.maxPrice === preset.max;
                        return (
                            <button
                                key={preset.label}
                                onClick={() => setPriceRange(preset.min, preset.max)}
                                className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-all ${isActive
                                    ? 'border-primary bg-primary-light text-primary'
                                    : 'border-border text-text-secondary hover:bg-surface hover:text-text-primary'
                                    }`}
                                style={
                                    isActive
                                        ? {
                                            borderColor: 'var(--primary)',
                                            background: 'var(--primary-light)',
                                            color: 'var(--primary)',
                                        }
                                        : undefined
                                }
                            >
                                {preset.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-text-primary mb-3">
                    Sortuj
                </label>

                {/* Quick price presets */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {[
                        { label: 'Najbliższe daty', key: 'StartDate' as EventSortableAccessor, order: 'Ascending' as SortDirection },
                        { label: 'Najtańsze', key: 'Price' as EventSortableAccessor, order: 'Ascending' as SortDirection },
                        { label: 'Najnowsze', key: 'CreatedAt' as EventSortableAccessor, order: 'Descending' as SortDirection },
                    ].map((preset) => {
                        const isActive =
                            params.sortKey === preset.key && params.order === preset.order;
                        return (
                            <button
                                key={preset.label}
                                onClick={() => setSorting(preset.key, preset.order)}
                                className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-all ${isActive
                                    ? 'border-primary bg-primary-light text-primary'
                                    : 'border-border text-text-secondary hover:bg-surface hover:text-text-primary'
                                    }`}
                                style={
                                    isActive
                                        ? {
                                            borderColor: 'var(--primary)',
                                            background: 'var(--primary-light)',
                                            color: 'var(--primary)',
                                        }
                                        : undefined
                                }
                            >
                                {preset.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}