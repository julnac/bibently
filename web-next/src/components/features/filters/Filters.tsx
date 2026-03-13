'use client';

import { useSearchFilters } from '@/src/hooks/useSearchFilters';

export default function Filters() {
    const { params, setCity, setDateRange, setPriceRange, resetAll } = useSearchFilters();

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

            {/* ── City ── */}
            <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Miasto</label>
                <select
                    className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={params.city || 'Gdańsk'}
                    onChange={(e) => setCity(e.target.value)}
                >
                    {['Gdańsk', 'Warszawa', 'Kraków', 'Wrocław', 'Poznań', 'Łódź', 'Gdynia', 'Sopot'].map(
                        (city) => (
                            <option key={city} value={city}>
                                {city}
                            </option>
                        )
                    )}
                </select>
            </div>

            {/* ── Date Range ── */}
            <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Data</label>
                <div className="flex gap-2">
                    <input
                        type="date"
                        className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={params.startDate || ''}
                        onChange={(e) =>
                            setDateRange(e.target.value || null, params.endDate)
                        }
                    />
                    <input
                        type="date"
                        className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={params.endDate || ''}
                        onChange={(e) =>
                            setDateRange(params.startDate, e.target.value || null)
                        }
                    />
                </div>
            </div>

            {/* ── Price Range ── */}
            <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Cena (PLN)</label>
                <div className="flex gap-2">
                    <input
                        type="number"
                        placeholder="Od"
                        className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={params.minPrice ?? ''}
                        onChange={(e) => {
                            const v = e.target.value ? parseInt(e.target.value) : null;
                            setPriceRange(v, params.maxPrice);
                        }}
                        min={0}
                    />
                    <input
                        type="number"
                        placeholder="Do"
                        className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        value={params.maxPrice ?? ''}
                        onChange={(e) => {
                            const v = e.target.value ? parseInt(e.target.value) : null;
                            setPriceRange(params.minPrice, v);
                        }}
                        min={0}
                    />
                </div>
            </div>

            {/* ── Quick Date Presets ── */}
            <div>
                <label className="block text-sm font-semibold text-text-primary mb-2">Szybki wybór</label>
                <div className="flex flex-wrap gap-2">
                    {[
                        { label: 'Dziś', action: () => { const d = new Date().toISOString().split('T')[0]; setDateRange(d, d); } },
                        { label: 'Ten weekend', action: () => { /* placeholder for date logic */ } },
                        { label: 'Za darmo', action: () => setPriceRange(0, 0) },
                    ].map((preset) => (
                        <button
                            key={preset.label}
                            onClick={preset.action}
                            className="px-3 py-1.5 rounded-full border border-border text-sm text-text-secondary hover:bg-surface hover:text-text-primary transition-all"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}