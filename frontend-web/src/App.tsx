import React, { useState, useMemo } from 'react';
import type { Filters, SortBy } from './types.ts';
import { mockEvents } from './data/mockData.ts';
import { useFavorites } from './hooks/useFavorites.ts';
import { EventCard } from './components/EventCard.tsx';
import { SearchIcon, LocationIcon, CurrentLocationIcon, ChevronDownIcon, StarIcon } from './components/icons.tsx';

const EVENT_TYPES = ["Concert", "Meetup", "Exhibition", "Festival", "Workshop", "Screening", "Sports", "Charity", "Family", "Networking", "Education", "Technology", "Art", "Food", "Film", "Culture", "Health", "Wellness", "Business"];
const RESULTS_PER_PAGE = 8;

const App: React.FC = () => {
    const [locationQuery, setLocationQuery] = useState('');
    const [filters, setFilters] = useState<Filters>({
        categories: [],
        date: undefined,
        city: undefined,
        maxTicketPrice: undefined,
        minRating: undefined,
        eventType: undefined,
    });
    const [sortBy, setSortBy] = useState<SortBy>('relevance');
    const [visibleCount, setVisibleCount] = useState(RESULTS_PER_PAGE);
    const [searchInput, setSearchInput] = useState('');
    const { favoriteIds, toggleFavorite } = useFavorites();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEvents = useMemo(() => {
        let results = [...mockEvents];
        const lowerCaseQuery = searchQuery.trim().toLowerCase();
        if (lowerCaseQuery) {
            results = results.filter(e =>
                e.name.toLowerCase().includes(lowerCaseQuery) ||
                e.categories.some(c => c.toLowerCase().includes(lowerCaseQuery))
            );
        }
        const lowerCaseLocation = locationQuery.trim().toLowerCase();
        if (lowerCaseLocation) {
            results = results.filter(e =>
                e.city.toLowerCase().includes(lowerCaseLocation) ||
                e.country.toLowerCase().includes(lowerCaseLocation)
            );
        }
        if (filters.categories.length > 0) {
            results = results.filter(e => filters.categories.some(cat => e.categories.includes(cat)));
        }
        if (filters.date) {
            results = results.filter(e => e.date === filters.date);
        }
        if (filters.city) {
            results = results.filter(e => e.city === filters.city);
        }
        if (filters.maxTicketPrice !== undefined) {
            results = results.filter(e => e.ticketPrice <= (filters.maxTicketPrice || Infinity));
        }
        if (filters.minRating !== undefined) {
            results = results.filter(e => e.rating >= (filters.minRating || 0));
        }
        if (filters.eventType) {
            results = results.filter(e => e.eventType === filters.eventType);
        }
        results.sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return b.rating - a.rating;
                case 'price_asc':
                    return a.ticketPrice - b.ticketPrice;
                case 'price_desc':
                    return b.ticketPrice - a.ticketPrice;
                case 'date_asc':
                    return a.date.localeCompare(b.date);
                case 'date_desc':
                    return b.date.localeCompare(a.date);
                case 'relevance':
                default:
                    return 0;
            }
        });
        return results;
    }, [searchQuery, locationQuery, filters, sortBy]);

    React.useEffect(() => {
        setVisibleCount(RESULTS_PER_PAGE);
    }, [searchQuery, locationQuery, filters, sortBy]);

    const handleFilterChange = <K extends keyof Filters>(key: K, value: Filters[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleUseCurrentLocation = () => {
        alert("Geolocation API would be used here. For this demo, we'll set the location to Manchester.");
        setLocationQuery("Manchester");
    }

    const visibleEvents = filteredEvents.slice(0, visibleCount);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                            <span role="img" aria-label="Event">🎉</span>
                            <span>EventFinder</span>
                        </div>
                        <div className="w-full md:max-w-2xl flex flex-col sm:flex-row gap-2">
                            <div className="relative flex-grow flex">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for events or keywords..."
                                    value={searchInput}
                                    onChange={e => setSearchInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            setSearchQuery(searchInput.trim());
                                        }
                                    }}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery(searchInput.trim())}
                                    className="px-4 py-2.5 bg-green-600 text-white font-semibold rounded-r-md hover:bg-green-700 transition-colors"
                                    aria-label="Search"
                                >
                                    Search
                                </button>
                            </div>
                            <div className="relative sm:w-56">
                                <LocationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Location"
                                    value={locationQuery}
                                    onChange={e => setLocationQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                />
                            </div>
                            <button
                                onClick={handleUseCurrentLocation}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                                aria-label="Use current location"
                            >
                                <CurrentLocationIcon className="w-5 h-5" />
                                <span className="hidden lg:inline">Use Current Location</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6">
                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-center">

                        {/* Event Type Filter */}
                        <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Event Type</label>
                            <select
                                value={filters.eventType || ''}
                                onChange={e => handleFilterChange('eventType', e.target.value || undefined)}
                                className="w-full mt-1 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md appearance-none bg-transparent font-semibold"
                            >
                                <option value="">All Types</option>
                                {EVENT_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Date</label>
                            <input
                                type="date"
                                value={filters.date || ''}
                                onChange={e => handleFilterChange('date', e.target.value || undefined)}
                                className="w-full mt-1 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md appearance-none bg-transparent font-semibold"
                            />
                        </div>

                        {/* Max Ticket Price Filter */}
                        <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Max Ticket Price</label>
                            <input
                                type="number"
                                min="0"
                                value={filters.maxTicketPrice ?? ''}
                                onChange={e => handleFilterChange('maxTicketPrice', e.target.value ? Number(e.target.value) : undefined)}
                                className="w-full mt-1 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md appearance-none bg-transparent font-semibold"
                                placeholder="No limit"
                            />
                        </div>

                        {/* Minimum Rating Filter */}
                        <div>
                            <label className="text-sm font-medium text-gray-500 block mb-1">Minimum Rating</label>
                            <div className="flex items-center">
                                {[5, 4, 3, 2, 1].map(r => (
                                    <button key={r} onClick={() => handleFilterChange('minRating', r)} aria-label={`Filter by ${r} stars and up`}>
                                        <StarIcon className={`w-6 h-6 transition ${filters.minRating && filters.minRating >= r ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort By */}
                        <div className="relative">
                            <label htmlFor="sort-by" className="text-sm font-medium text-gray-500">Sort By</label>
                            <select
                                id="sort-by"
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value as SortBy)}
                                className="w-full mt-1 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md appearance-none bg-transparent font-semibold"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="rating">Rating</option>
                                <option value="price_asc">Price (Low to High)</option>
                                <option value="price_desc">Price (High to Low)</option>
                                <option value="date_asc">Date (Soonest)</option>
                                <option value="date_desc">Date (Latest)</option>
                            </select>
                            <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-2 top-9 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Event Grid */}
                {filteredEvents.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {visibleEvents.map(event => (
                                <EventCard
                                    key={event.id}
                                    event={event}
                                    isFavorite={favoriteIds.has(event.id)}
                                    onToggleFavorite={toggleFavorite}
                                />
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <p className="text-gray-500 mb-4">
                                Showing {visibleEvents.length} of {filteredEvents.length} results.
                            </p>
                            {visibleCount < filteredEvents.length && (
                                <button
                                    onClick={() => setVisibleCount(prev => prev + RESULTS_PER_PAGE)}
                                    className="bg-gray-800 text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    Load More Events
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-gray-700">No Events Found</h2>
                        <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
