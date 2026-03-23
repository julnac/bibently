'use client';

import { useSearchFilters } from '@/src/hooks/useSearchFilters';
import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, Navigation, TagIcon, Tag, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import DatePickerPopover from './DatePicker';
import { useRouter, usePathname } from 'next/navigation';
import { useUserLocation } from '@/src/store/useLocation';

const CITIES = ['Gdańsk', 'Sopot', 'Gdynia'];

export default function SearchBar() {
    const { params, setCity, setDateRange, setName, setPriceRange, setLocation } = useSearchFilters();
    const router = useRouter();
    const pathname = usePathname();
    const { requestLocation, location } = useUserLocation();

    // Unified popover state
    const [activeTab, setActiveTab] = useState<'city' | 'date' | 'price' | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    // City state
    const [cityInput, setCityInput] = useState(params.city || (params.radiusKm ? `Near you (${params.radiusKm}km)` : ''));
    const [selectedRadius, setSelectedRadius] = useState<number | null>(params.radiusKm || null);

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
        setCityInput(params.city || (params.radiusKm ? `Near you (${params.radiusKm}km)` : ''));
        setNameInput(params.name || '');
        setStartDate(params.startDate || null);
        setEndDate(params.endDate || null);
        setMinPrice(params.minPrice ?? 0);
        setMaxPrice(params.maxPrice ?? MAX_POSSIBLE_PRICE);
        setSelectedRadius(params.radiusKm || null);
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
        setActiveTab('date');
    };

    const handleSearch = (overrides?: { clearCity?: boolean, clearDate?: boolean, clearPrice?: boolean }) => {
        setActiveTab(null);
        let trimmedCity = overrides?.clearCity ? '' : cityInput.trim();
        const trimmedName = nameInput.trim();

        let lat: number | null = null;
        let lng: number | null = null;
        let rad: number | null = null;

        if (!overrides?.clearCity) {
            if (trimmedCity.startsWith('Near you') && location && selectedRadius) {
                trimmedCity = '';
                lat = location.latitude;
                lng = location.longitude;
                rad = selectedRadius;
            } else if (trimmedCity.startsWith('Near you')) {
                trimmedCity = '';
                if (selectedRadius && params.latitude && params.longitude) {
                    lat = params.latitude;
                    lng = params.longitude;
                    rad = selectedRadius;
                }
            }
        }

        const effectiveStartDate = overrides?.clearDate ? null : startDate;
        const effectiveEndDate = overrides?.clearDate ? null : endDate;
        const effectiveMinPrice = overrides?.clearPrice ? 0 : minPrice;
        const effectiveMaxPrice = overrides?.clearPrice ? MAX_POSSIBLE_PRICE : maxPrice;
        const effectiveIsFree = overrides?.clearPrice ? false : isFree;

        if (pathname !== '/') {
            const searchParams = new URLSearchParams();
            if (trimmedCity) searchParams.set('city', trimmedCity);
            if (trimmedName) searchParams.set('name', trimmedName);
            if (effectiveStartDate) searchParams.set('startDate', effectiveStartDate);
            if (effectiveEndDate) searchParams.set('endDate', effectiveEndDate);
            if (lat !== null) searchParams.set('latitude', lat.toString());
            if (lng !== null) searchParams.set('longitude', lng.toString());
            if (rad !== null) searchParams.set('radiusKm', rad.toString());

            if (effectiveMinPrice > 0 || effectiveMaxPrice < MAX_POSSIBLE_PRICE) {
                searchParams.set('minPrice', effectiveMinPrice.toString());
                searchParams.set('maxPrice', effectiveMaxPrice.toString());
            }

            router.push(`/?${searchParams.toString()}`);
        } else {
            setCity(trimmedCity || null);
            setName(trimmedName || null);
            setDateRange(effectiveStartDate, effectiveEndDate);
            setPriceRange((effectiveMinPrice > 0 || effectiveIsFree) ? effectiveMinPrice : null, effectiveMaxPrice < MAX_POSSIBLE_PRICE ? effectiveMaxPrice : null);
            setLocation(lat, lng, rad);
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

    // Fixed segment width (desktop)
    const SEGMENT_W = 180;
    const SEARCH_BTN_AREA = 40; // includes margin

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

            <div className="flex items-center justify-between gap-4 w-full relative z-[20]" ref={filterContainerRef}>

                {/* ── 3-Step Filter (Desktop — md+) ── */}
                <div className="hidden md:flex w-full justify-center">
                    <div
                        className={`flex items-center justify-center h-10 rounded-full transition-all duration-300 relative ${isFilterActive ? 'bg-surface' : 'bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.05)]'}`}
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
                            <span className='truncate text-xs text-text-secondary'>{cityInput || 'Where?'}</span>
                        </button>

                        {/* Segment: When */}
                        <div
                            className={`relative z-[2] h-full flex items-center gap-2 px-4 text-left transition-colors rounded-full ${activeTab === 'date' ? '' : 'hover:bg-white/40'}`}
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
                                <span className='truncate text-xs text-text-secondary'>{dateDisplay || 'When?'}</span>
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
                            className={`relative z-[2] h-full flex items-center gap-2 px-4 text-left transition-colors rounded-full ${activeTab === 'price' ? '' : 'hover:bg-white/40'}`}
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
                                <span className='truncate text-xs text-text-secondary'>{priceDisplay}</span>
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
                            className="relative z-[2] w-9 h-9 rounded-full bg-brand-accent flex justify-center items-center text-white shrink-0 hover:opacity-90 transition-all"
                            aria-label="Search"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSearch();
                            }}
                        >
                            <Search size={15} strokeWidth={2.5} />
                        </button>

                        {/* ── Desktop Dropdowns ── */}
                        {renderCityDropdown(activeTab, handleCitySelect, selectedRadius, cityInput, isLoadingLocation, location, setSelectedRadius, setIsLoadingLocation, requestLocation)}
                        {renderDateDropdown(activeTab, startDate, endDate, setStartDate, setEndDate)}
                        {renderPriceDropdown(activeTab, isFree, minPrice, maxPrice, MAX_POSSIBLE_PRICE, setMinPrice, setMaxPrice)}
                    </div>
                </div>

                {/* ── Mobile Compact Search Bar ── */}
                <div className="flex md:hidden w-full relative">
                    <div className="flex items-center gap-2 w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-1">
                        {/* Where */}
                        <div className="relative shrink-0 flex items-center">
                            <button
                                className={`flex items-center gap-1.5 h-10 px-4 text-left rounded-full transition-colors ${activeTab === 'city' ? 'bg-white border-primary border' : 'bg-surface hover:bg-white/40 border border-transparent'} ${(cityInput || params.radiusKm) ? 'pr-9' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab(activeTab === 'city' ? null : 'city');
                                }}
                            >
                                <MapPin size={14} className="text-text-secondary shrink-0" />
                                <span className="truncate text-xs text-text-secondary max-w-[120px]">{cityInput || 'Where?'}</span>
                            </button>
                            {(cityInput || params.radiusKm) && (
                                <button
                                    className="absolute right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors z-[2]"
                                    aria-label="Clear location filter"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCityInput('');
                                        setSelectedRadius(null);
                                        handleSearch({ clearCity: true });
                                    }}
                                >
                                    <X size={12} className="text-text-secondary" />
                                </button>
                            )}
                        </div>

                        {/* When */}
                        <div className="relative shrink-0 flex items-center">
                            <button
                                className={`flex items-center gap-1.5 h-10 px-4 text-left rounded-full transition-colors ${activeTab === 'date' ? 'bg-white border-primary border' : 'bg-surface hover:bg-white/40 border border-transparent'} ${(startDate || endDate) ? 'pr-9' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab(activeTab === 'date' ? null : 'date');
                                }}
                            >
                                <Calendar size={14} className="text-text-secondary shrink-0" />
                                <span className="truncate text-xs text-text-secondary max-w-[120px]">{dateDisplay || 'When?'}</span>
                            </button>
                            {(startDate || endDate) && (
                                <button
                                    className="absolute right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors z-[2]"
                                    aria-label="Clear date filter"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setStartDate(null);
                                        setEndDate(null);
                                        handleSearch({ clearDate: true });
                                    }}
                                >
                                    <X size={12} className="text-text-secondary" />
                                </button>
                            )}
                        </div>

                        {/* Price */}
                        <div className="relative shrink-0 flex items-center pr-2">
                            <button
                                className={`flex items-center gap-1.5 h-10 px-4 text-left rounded-full transition-colors ${activeTab === 'price' ? 'bg-white border-primary border' : 'bg-surface hover:bg-white/40 border border-transparent'} ${(isFree || minPrice > 0 || maxPrice < MAX_POSSIBLE_PRICE) ? 'pr-9' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab(activeTab === 'price' ? null : 'price');
                                }}
                            >
                                <Tag size={14} className="text-text-secondary shrink-0" />
                                <span className="truncate text-xs text-text-secondary max-w-[120px]">
                                    {isFree ? 'Free' : (minPrice > 0 || maxPrice < MAX_POSSIBLE_PRICE) ? `${minPrice}-${maxPrice} zł` : 'Price?'}
                                </span>
                            </button>
                            {(isFree || minPrice > 0 || maxPrice < MAX_POSSIBLE_PRICE) && (
                                <button
                                    className="absolute right-4 w-6 h-6 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors z-[2]"
                                    aria-label="Clear price filter"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setMinPrice(0);
                                        setMaxPrice(MAX_POSSIBLE_PRICE);
                                        handleSearch({ clearPrice: true });
                                    }}
                                >
                                    <X size={12} className="text-text-secondary" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Mobile Dropdowns ── */}
                    {renderCityDropdownMobile(activeTab, handleCitySelect, selectedRadius, cityInput, isLoadingLocation, location, setSelectedRadius, setIsLoadingLocation, requestLocation, handleSearch)}
                    {renderDateDropdownMobile(activeTab, startDate, endDate, setStartDate, setEndDate, handleSearch)}
                    {renderPriceDropdownMobile(activeTab, isFree, minPrice, maxPrice, MAX_POSSIBLE_PRICE, setMinPrice, setMaxPrice, handleSearch)}
                </div>
            </div>
        </>
    );
}

/* ────────────────────────────────────────────────────────────────────────────────
   Desktop Dropdown Renderers (same as before)
──────────────────────────────────────────────────────────────────────────────── */

function renderCityDropdown(
    activeTab: string | null,
    handleCitySelect: (city: string) => void,
    selectedRadius: number | null,
    cityInput: string,
    isLoadingLocation: boolean,
    location: { latitude: number | null; longitude: number | null } | null,
    setSelectedRadius: (r: number) => void,
    setIsLoadingLocation: (v: boolean) => void,
    requestLocation: () => Promise<{ latitude: number | null; longitude: number | null } | null>,
) {
    if (activeTab !== 'city') return null;
    return (
        <div className="absolute top-16 left-0 w-[400px] bg-white rounded-[24px] shadow-[0_8px_28px_rgba(0,0,0,0.12)] border border-border p-6 z-[50]">
            <div className="text-xs font-bold text-text-primary mb-3">Near you</div>
            <div className="flex flex-wrap gap-2 mb-6">
                {[2, 5, 15, 20, 40].map((radius) => (
                    <button
                        key={radius}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center ${isLoadingLocation ? 'opacity-70 cursor-not-allowed' : 'hover:border-primary'
                            } ${selectedRadius === radius && cityInput.startsWith('Near you') ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}
                        disabled={isLoadingLocation}
                        onClick={async (e) => {
                            e.stopPropagation();
                            if (isLoadingLocation) return;
                            if (location) {
                                setSelectedRadius(radius);
                                handleCitySelect(`Near you (${radius}km)`);
                                return;
                            }
                            setIsLoadingLocation(true);
                            try {
                                const coords = await requestLocation();
                                if (coords) {
                                    setSelectedRadius(radius);
                                    handleCitySelect(`Near you (${radius}km)`);
                                } else {
                                    alert('Nie udało się pobrać lokalizacji. Sprawdź ustawienia przeglądarki.');
                                }
                            } finally {
                                setIsLoadingLocation(false);
                            }
                        }}
                    >
                        {isLoadingLocation ? <Loader2 size={12} className="animate-spin mr-1.5" /> : ''}
                        {radius} km
                    </button>
                ))}
            </div>

            <div className="text-xs font-bold text-text-primary mb-3">Popular destinations</div>
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
    );
}

function renderDateDropdown(
    activeTab: string | null,
    startDate: string | null,
    endDate: string | null,
    setStartDate: (d: string | null) => void,
    setEndDate: (d: string | null) => void,
) {
    if (activeTab !== 'date') return null;
    return (
        <div className="absolute top-16 left-50 z-[50]" style={{ transform: 'translateX(-30%)' }}>
            <DatePickerPopover
                startDate={startDate}
                endDate={endDate}
                onSelect={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                }}
            />
        </div>
    );
}

function renderPriceDropdown(
    activeTab: string | null,
    isFree: boolean,
    minPrice: number,
    maxPrice: number,
    MAX_POSSIBLE_PRICE: number,
    setMinPrice: (v: number) => void,
    setMaxPrice: (v: number) => void,
) {
    if (activeTab !== 'price') return null;
    return (
        <div className="absolute top-16 right-0 w-[420px] bg-white rounded-[24px] shadow-[0_8px_28px_rgba(0,0,0,0.12)] border border-border p-8 pt-6 z-[50]">
            {renderPriceContent(isFree, minPrice, maxPrice, MAX_POSSIBLE_PRICE, setMinPrice, setMaxPrice)}
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────────────────
   Mobile Dropdown Renderers (full-width, positioned below the compact bar)
──────────────────────────────────────────────────────────────────────────────── */

function renderCityDropdownMobile(
    activeTab: string | null,
    handleCitySelect: (city: string) => void,
    selectedRadius: number | null,
    cityInput: string,
    isLoadingLocation: boolean,
    location: { latitude: number | null; longitude: number | null } | null,
    setSelectedRadius: (r: number) => void,
    setIsLoadingLocation: (v: boolean) => void,
    requestLocation: () => Promise<{ latitude: number | null; longitude: number | null } | null>,
    handleSearch: () => void,
) {
    if (activeTab !== 'city') return null;
    return (
        <div className="absolute top-14 left-0 right-0 bg-white rounded-[20px] shadow-[0_8px_28px_rgba(0,0,0,0.12)] border border-border p-5 z-[50]">
            <div className="text-xs font-bold text-text-primary mb-3">Near you</div>
            <div className="flex flex-wrap gap-2 mb-5">
                {[2, 5, 15, 20, 40].map((radius) => (
                    <button
                        key={radius}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center ${isLoadingLocation ? 'opacity-70 cursor-not-allowed' : 'hover:border-primary'
                            } ${selectedRadius === radius && cityInput.startsWith('Near you') ? 'bg-primary text-white border-primary' : 'bg-surface text-text-secondary border-border'}`}
                        disabled={isLoadingLocation}
                        onClick={async (e) => {
                            e.stopPropagation();
                            if (isLoadingLocation) return;
                            if (location) {
                                setSelectedRadius(radius);
                                handleCitySelect(`Near you (${radius}km)`);
                                return;
                            }
                            setIsLoadingLocation(true);
                            try {
                                const coords = await requestLocation();
                                if (coords) {
                                    setSelectedRadius(radius);
                                    handleCitySelect(`Near you (${radius}km)`);
                                } else {
                                    alert('Nie udało się pobrać lokalizacji.');
                                }
                            } finally {
                                setIsLoadingLocation(false);
                            }
                        }}
                    >
                        {isLoadingLocation ? <Loader2 size={12} className="animate-spin mr-1.5" /> : ''}
                        {radius} km
                    </button>
                ))}
            </div>

            <div className="text-xs font-bold text-text-primary mb-3">Popular destinations</div>
            <div className="flex flex-col gap-1">
                {['Gdańsk', 'Gdynia', 'Sopot'].map((city) => (
                    <button
                        key={city}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-hover transition-colors text-left"
                        onClick={(e) => { e.stopPropagation(); handleCitySelect(city); }}
                    >
                        <div className="w-10 h-10 rounded-md bg-surface flex items-center justify-center text-text-primary border border-border shrink-0">
                            <MapPin size={16} />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-text-primary">{city}</div>
                            <div className="text-xs text-text-secondary">Popular destination</div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border flex justify-end">
                <button
                    className="flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-brand-accent text-white hover:opacity-90 transition-all font-semibold text-sm w-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSearch();
                    }}
                >
                    <Search size={14} strokeWidth={2.5} />
                    Search
                </button>
            </div>
        </div>
    );
}

function renderDateDropdownMobile(
    activeTab: string | null,
    startDate: string | null,
    endDate: string | null,
    setStartDate: (d: string | null) => void,
    setEndDate: (d: string | null) => void,
    handleSearch: () => void,
) {
    if (activeTab !== 'date') return null;
    return (
        <div className="absolute top-14 left-0 right-0 z-[50] flex flex-col gap-2">
            <DatePickerPopover
                startDate={startDate}
                endDate={endDate}
                onSelect={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                }}
            />
            <button
                className="flex items-center justify-center gap-2 h-12 px-6 rounded-[20px] bg-brand-accent text-white shadow-[0_8px_28px_rgba(0,0,0,0.12)] border border-brand-accent hover:opacity-90 transition-all font-semibold text-sm w-full"
                onClick={(e) => {
                    e.stopPropagation();
                    handleSearch();
                }}
            >
                <Search size={14} strokeWidth={2.5} />
                Search
            </button>
        </div>
    );
}

function renderPriceDropdownMobile(
    activeTab: string | null,
    isFree: boolean,
    minPrice: number,
    maxPrice: number,
    MAX_POSSIBLE_PRICE: number,
    setMinPrice: (v: number) => void,
    setMaxPrice: (v: number) => void,
    handleSearch: () => void,
) {
    if (activeTab !== 'price') return null;
    return (
        <div className="absolute top-14 left-0 right-0 bg-white rounded-[20px] shadow-[0_8px_28px_rgba(0,0,0,0.12)] border border-border p-5 z-[50]">
            {renderPriceContent(isFree, minPrice, maxPrice, MAX_POSSIBLE_PRICE, setMinPrice, setMaxPrice)}

            <div className="mt-4 pt-4 border-t border-border flex justify-end">
                <button
                    className="flex items-center justify-center gap-2 h-10 px-6 rounded-[20px] bg-brand-accent text-white hover:opacity-90 transition-all font-semibold text-sm w-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSearch();
                    }}
                >
                    <Search size={14} strokeWidth={2.5} />
                    Search
                </button>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────────────────────────────
   Shared Price Content
──────────────────────────────────────────────────────────────────────────────── */

function renderPriceContent(
    isFree: boolean,
    minPrice: number,
    maxPrice: number,
    MAX_POSSIBLE_PRICE: number,
    setMinPrice: (v: number) => void,
    setMaxPrice: (v: number) => void,
) {
    return (
        <>
            {/* Free Toggle */}
            <div className="flex justify-start mb-6">
                <button
                    className={`px-5 py-2 rounded-full text-xs transition-all border ${isFree ? 'bg-foreground text-white border-foreground' : 'bg-white text-text-primary border-border hover:border-text-primary'}`}
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
            <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                    <span className="text-xs text-text-secondary font-medium">Minimum</span>
                    <div className="flex items-center border border-border rounded-full px-4 py-2 focus-within:border-primary transition-colors">
                        <input
                            type="number"
                            className="text-sm text-text-primary bg-transparent outline-none w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                        <span className="text-sm text-text-secondary ml-1 shrink-0">zł</span>
                    </div>
                </div>
                <div className="flex flex-col gap-1.5 flex-1 items-end">
                    <span className="text-xs text-text-secondary font-medium">Maximum</span>
                    <div className="flex items-center border border-border rounded-full px-4 py-2 w-full focus-within:border-primary transition-colors">
                        <input
                            type="number"
                            className="text-sm text-text-primary bg-transparent outline-none w-full appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                        <span className="text-sm text-text-secondary ml-1 shrink-0">zł</span>
                    </div>
                </div>
            </div>
        </>
    );
}