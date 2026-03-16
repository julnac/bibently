'use client';

import { useSearchFilters } from '@/src/hooks/useSearchFilters';
import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Navigation, TagIcon, Tag, X } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import DatePickerPopover from './DatePicker';
import { useRouter, usePathname } from 'next/navigation';

const CITIES = ['Gdańsk', 'Sopot', 'Gdynia'];

export default function SearchBar() {
    const { params, setCity, setDateRange, setName, setPriceRange } = useSearchFilters();
    const router = useRouter();
    const pathname = usePathname();

    // Unified popover state
    const [activeTab, setActiveTab] = useState<'city' | 'date' | 'price' | null>(null);

    // City state
    const [cityInput, setCityInput] = useState(params.city || '');

    // Date state (buffered)
    const [startDate, setStartDate] = useState<string | null>(params.startDate || null);
    const [endDate, setEndDate] = useState<string | null>(params.endDate || null);

    // Name state
    const [nameInput, setNameInput] = useState(params.name || '');

    // Price state
    const MAX_POSSIBLE_PRICE = 560;
    const [minPrice, setMinPrice] = useState<number>(params.minPrice ?? 0);
    const [maxPrice, setMaxPrice] = useState<number>(params.maxPrice ?? MAX_POSSIBLE_PRICE);
    const isFree = minPrice === 0 && maxPrice === 0;

    // Sync local state
    useEffect(() => {
        setCityInput(params.city || '');
        setNameInput(params.name || '');
        setStartDate(params.startDate || null);
        setEndDate(params.endDate || null);
        setMinPrice(params.minPrice ?? 0);
        setMaxPrice(params.maxPrice ?? MAX_POSSIBLE_PRICE);
    }, [params]);

    // Close on click outside the filter container
    const filterContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (activeTab && filterContainerRef.current && !filterContainerRef.current.contains(e.target as Node)) {
                setActiveTab(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [activeTab]);

    const handleCitySelect = (city: string) => {
        setCityInput(city);
        setActiveTab('date'); // auto-advance to date picker
    };

    const handleSearch = () => {
        setActiveTab(null);
        const trimmedCity = cityInput.trim() === 'Near you' ? '' : cityInput.trim();
        const trimmedName = nameInput.trim();

        if (pathname !== '/') {
            const searchParams = new URLSearchParams();
            if (trimmedCity) searchParams.set('city', trimmedCity);
            if (trimmedName) searchParams.set('name', trimmedName);
            if (startDate) searchParams.set('startDate', startDate);
            if (endDate) searchParams.set('endDate', endDate);

            // Only add min/max prices if they differ from pure defaults
            if (minPrice > 0 || maxPrice < MAX_POSSIBLE_PRICE) {
                searchParams.set('minPrice', minPrice.toString());
                searchParams.set('maxPrice', maxPrice.toString());
            }

            router.push(`/?${searchParams.toString()}`);
        } else {
            setCity(trimmedCity || null);
            setName(trimmedName || null);
            setDateRange(startDate, endDate);
            setPriceRange((minPrice > 0 || isFree) ? minPrice : null, maxPrice < MAX_POSSIBLE_PRICE ? maxPrice : null);
        }
    };

    const formatDateDisplay = () => {
        if (!startDate) return null;
        const start = new Date(startDate);
        if (!endDate || startDate === endDate) {
            return format(start, 'd MMM', { locale: pl });
        }
        const end = new Date(endDate);
        return `${format(start, 'd MMM', { locale: pl })} – ${format(end, 'd MMM', { locale: pl })}`;
    };

    const dateDisplay = formatDateDisplay();
    const priceDisplay = isFree ? 'Free' : (minPrice === 0 && maxPrice === MAX_POSSIBLE_PRICE) ? 'Price range?' : `${minPrice} zł - ${maxPrice} zł`;
    const isFilterActive = activeTab !== null;

    // Fixed segment width
    const SEGMENT_W = 220;
    const SEARCH_BTN_AREA = 44; // includes margin

    // Pill position mapping
    const pillIndex = activeTab === 'city' ? 0 : activeTab === 'date' ? 1 : activeTab === 'price' ? 2 : -1;

    return (
        <>
            {/* Dimmer Backdrop — persistent across tab switches */}
            <div
                className={`fixed inset-0 z-[10] transition-opacity duration-300 ${isFilterActive ? 'bg-black/25 backdrop-blur-[1px] opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                style={{ top: 'var(--nav-height)' }}
                onClick={() => setActiveTab(null)}
            />

            <div className="flex items-center gap-4 w-full relative z-[20]">
                {/* ── Text Search (Name) ── */}
                <div className="flex items-center bg-surface rounded-full pl-4 pr-1 h-11 flex-1 shadow-[0_4px_12px_rgba(0,0,0,0.05)] max-w-xs">
                    <Search size={16} className="text-text-secondary shrink-0 mr-2" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="text-sm font-mono text-text-primary bg-transparent outline-none w-full placeholder:text-text-secondary"
                        value={nameInput}
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab(null);
                        }}
                        onChange={(e) => setNameInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch();
                        }}
                    />
                    <button
                        className="relative z-[2] w-10 h-10 rounded-full bg-brand-accent flex justify-center items-center text-white shrink-0 hover:opacity-90 transition-all"
                        aria-label="Search"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSearch();
                        }}
                    >
                        <Search size={16} strokeWidth={2.5} />
                    </button>
                </div>

                {/* ── 3-Step Filter ── */}
                <div className="relative" ref={filterContainerRef}>
                    <div
                        className={`flex items-center h-12 rounded-full transition-all duration-300 relative ${isFilterActive ? 'bg-surface-hover' : 'bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.05)]'}`}
                        style={{ width: `${SEGMENT_W * 3 + SEARCH_BTN_AREA}px` }}
                    >
                        {/* ── Sliding white pill indicator ── */}
                        <div
                            className={`absolute top-0 h-full rounded-full bg-white shadow-lg border border-border/50 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${pillIndex >= 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                            style={{
                                width: `${pillIndex === 2 ? SEGMENT_W + SEARCH_BTN_AREA : SEGMENT_W}px`,
                                left: `${pillIndex >= 0 ? pillIndex * SEGMENT_W : 0}px`,
                            }}
                        />

                        {/* ── Dividers (only visible when no tab active) ── */}
                        {!isFilterActive && (
                            <>
                                <div className="absolute h-5 w-px bg-border" style={{ left: `${SEGMENT_W}px` }} />
                                <div className="absolute h-5 w-px bg-border" style={{ left: `${SEGMENT_W * 2}px` }} />
                            </>
                        )}

                        {/* Segment: Where */}
                        <button
                            className={`relative z-[2] h-full flex items-center gap-2 px-5 text-left transition-colors rounded-full ${activeTab === 'city' ? '' : 'hover:bg-white/40'}`}
                            style={{ width: `${SEGMENT_W}px` }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab(activeTab === 'city' ? null : 'city');
                            }}
                        >
                            <MapPin size={16} className="text-text-secondary shrink-0" />
                            <span className='truncate text-sm font-mono text-text-secondary'>{cityInput || 'Where?'}</span>
                        </button>

                        {/* Segment: When */}
                        <div
                            className={`relative z-[2] h-full flex items-center gap-2 px-5 text-left transition-colors rounded-full ${activeTab === 'date' ? '' : 'hover:bg-white/40'}`}
                            style={{ width: `${SEGMENT_W}px` }}
                        >
                            <button
                                className="flex items-center gap-2 h-full flex-1 min-w-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab(activeTab === 'date' ? null : 'date');
                                }}
                            >
                                <Calendar size={16} className="text-text-secondary shrink-0" />
                                <span className='truncate text-sm font-mono text-text-secondary'>{dateDisplay || 'When?'}</span>
                            </button>
                            {dateDisplay && (
                                <button
                                    className="shrink-0 w-5 h-5 rounded-full bg-surface-hover hover:bg-border flex items-center justify-center transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setStartDate(null);
                                        setEndDate(null);
                                    }}
                                >
                                    <X size={12} className="text-text-secondary" />
                                </button>
                            )}
                        </div>

                        {/* Segment: Price */}
                        <div
                            className={`relative z-[2] h-full flex items-center gap-2 pl-5 pr-2 text-left transition-colors rounded-full ${activeTab === 'price' ? '' : 'hover:bg-white/40'}`}
                            style={{ width: `${SEGMENT_W}px` }}
                        >
                            <button
                                className="flex items-center gap-2 h-full flex-1 min-w-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab(activeTab === 'price' ? null : 'price');
                                }}
                            >
                                <Tag size={16} className="text-text-secondary shrink-0" />
                                <span className='truncate text-sm font-mono text-text-secondary'>{priceDisplay}</span>
                            </button>
                            {(isFree || minPrice > 0 || maxPrice < MAX_POSSIBLE_PRICE) && (
                                <button
                                    className="shrink-0 w-5 h-5 rounded-full bg-surface-hover hover:bg-border flex items-center justify-center transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMinPrice(0);
                                        setMaxPrice(MAX_POSSIBLE_PRICE);
                                    }}
                                >
                                    <X size={12} className="text-text-secondary" />
                                </button>
                            )}
                        </div>

                        {/* Search Button */}
                        <button
                            className="relative z-[2] w-10 h-10 rounded-full bg-brand-accent flex justify-center items-center text-white shrink-0 hover:opacity-90 transition-all"
                            aria-label="Search"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSearch();
                            }}
                        >
                            <Search size={16} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* ── Dropdowns (rendered outside segments for clean layout) ── */}

                    {/* City Dropdown */}
                    {activeTab === 'city' && (
                        <div className="absolute top-16 left-0 w-[400px] bg-white rounded-[24px] shadow-[0_8px_28px_rgba(0,0,0,0.12)] border border-border p-6 z-[50]">
                            <div className="text-xs font-bold text-text-primary mb-4">Suggested locations</div>
                            <div className="flex flex-col gap-2">
                                <button
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-hover transition-colors text-left"
                                    onClick={(e) => { e.stopPropagation(); handleCitySelect('Near you'); }}
                                >
                                    <div className="w-12 h-12 rounded-md bg-blue-50 text-brand-primary flex items-center justify-center border border-blue-100 shrink-0">
                                        <Navigation size={20} className="fill-brand-primary" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-text-primary">Near you</div>
                                        <div className="text-xs text-text-secondary mt-0.5">Search in current location</div>
                                    </div>
                                </button>
                            </div>
                            <div className="flex flex-col gap-2 mb-6">
                                {['Gdańsk', 'Gdynia', 'Sopot'].map((city) => (
                                    <button
                                        key={city}
                                        className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-hover transition-colors text-left"
                                        onClick={(e) => { e.stopPropagation(); handleCitySelect(city); }}
                                    >
                                        <div className="w-12 h-12 rounded-md bg-surface flex items-center justify-center text-text-primary border border-border shrink-0">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-semibold text-text-primary">{city}</div>
                                            <div className="text-xs text-text-secondary mt-0.5">Popular destination</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Date Picker Dropdown */}
                    {activeTab === 'date' && (
                        <div className="absolute top-16 z-[50]" style={{ left: `${SEGMENT_W}px`, transform: 'translateX(-30%)' }}>
                            <DatePickerPopover
                                startDate={startDate}
                                endDate={endDate}
                                onSelect={(start, end) => {
                                    setStartDate(start);
                                    setEndDate(end);
                                }}
                            />
                        </div>
                    )}

                    {/* Price Dropdown */}
                    {activeTab === 'price' && (
                        <div className="absolute top-16 right-0 w-[420px] bg-white rounded-[24px] shadow-[0_8px_28px_rgba(0,0,0,0.12)] border border-border p-8 pt-6 z-[50]">
                            {/* Free Toggle */}
                            <div className="flex justify-start mb-6">
                                <button
                                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all border ${isFree ? 'bg-foreground text-white border-foreground' : 'bg-white text-text-primary border-border hover:border-text-primary'}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (isFree) {
                                            setMinPrice(0);
                                            setMaxPrice(MAX_POSSIBLE_PRICE);
                                        } else {
                                            setMinPrice(0);
                                            setMaxPrice(0);
                                        }
                                    }}
                                >
                                    Free
                                </button>
                            </div>

                            {/* Histogram + Slider combined */}
                            <div className="relative mb-10">
                                {/* Histogram bars */}
                                <div className="flex items-end h-24 gap-[3px] px-2">
                                    {[2, 4, 3, 6, 9, 14, 25, 20, 15, 12, 18, 22, 16, 10, 8, 5, 3, 4, 2, 1].map((val, i) => {
                                        const step = MAX_POSSIBLE_PRICE / 20;
                                        const barMin = i * step;
                                        const barMax = (i + 1) * step;
                                        const isHighlighted = (maxPrice >= barMin && minPrice <= barMax) && !isFree;
                                        return (
                                            <div key={i} className="flex-1 flex items-end">
                                                <div className={`w-full rounded-t-sm transition-colors ${isHighlighted ? 'bg-brand-accent' : 'bg-border/40'}`} style={{ height: `${val * 3.5}px` }}></div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Slider track + thumbs */}
                                <div className="relative h-0 w-full" style={{ marginTop: '-2px' }}>
                                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-border rounded-full"></div>
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 h-[2px] bg-brand-accent rounded-full"
                                        style={{
                                            left: `${(minPrice / MAX_POSSIBLE_PRICE) * 100}%`,
                                            right: `${100 - (maxPrice / MAX_POSSIBLE_PRICE) * 100}%`
                                        }}
                                    ></div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={MAX_POSSIBLE_PRICE}
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice - 1))}
                                        className="dual-slider-input"
                                        style={{ zIndex: minPrice > MAX_POSSIBLE_PRICE - 100 ? 5 : 4 }}
                                    />
                                    <input
                                        type="range"
                                        min={0}
                                        max={MAX_POSSIBLE_PRICE}
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice + 1))}
                                        className="dual-slider-input"
                                        style={{ zIndex: maxPrice < 100 ? 5 : 4 }}
                                    />
                                </div>
                            </div>

                            {/* Min / Max Inputs */}
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-xs text-text-secondary font-medium">Minimum</span>
                                    <div className="flex items-center border border-border rounded-full px-4 py-2 w-[130px] focus-within:border-primary transition-colors">
                                        <input
                                            type="number"
                                            className="text-sm font-mono text-text-primary bg-transparent outline-none w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            value={minPrice}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => setMinPrice(Number(e.target.value))}
                                            onBlur={(e) => {
                                                let val = Number(e.target.value);
                                                if (val < 0) val = 0;
                                                if (val > maxPrice) val = maxPrice;
                                                setMinPrice(val);
                                            }}
                                        />
                                        <span className="text-sm font-mono text-text-secondary ml-1 shrink-0">zł</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5 items-end">
                                    <span className="text-xs text-text-secondary font-medium">Maximum</span>
                                    <div className="flex items-center border border-border rounded-full px-4 py-2 w-[130px] focus-within:border-primary transition-colors">
                                        <input
                                            type="number"
                                            className="text-sm font-mono text-text-primary bg-transparent outline-none w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            value={maxPrice}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                                            onBlur={(e) => {
                                                let val = Number(e.target.value);
                                                if (val > MAX_POSSIBLE_PRICE) val = MAX_POSSIBLE_PRICE;
                                                if (val < minPrice) val = minPrice;
                                                setMaxPrice(val);
                                            }}
                                        />
                                        <span className="text-sm font-mono text-text-secondary ml-1 shrink-0">zł</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}