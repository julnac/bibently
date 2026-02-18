'use client';

import { useQueryStates, parseAsString, parseAsInteger } from 'nuqs';
import { useMemo } from 'react';
import { EventQueryParams } from '../types/event.params';

/**
 * URL-synced search filters using nuqs.
 * Every filter parameter is reflected in the browser URL,
 * making search states shareable and bookmarkable.
 */
export const useSearchFilters = () => {
    const [params, setParams] = useQueryStates({
        city: parseAsString.withDefault('Gdańsk'),
        category: parseAsString,
        startDate: parseAsString,
        endDate: parseAsString,
        minPrice: parseAsInteger,
        maxPrice: parseAsInteger,
        name: parseAsString,
    });

    // Convert URL params → EventQueryParams for the API
    const filters: EventQueryParams = useMemo(
        () => ({
            City: params.city || undefined,
            Category: params.category || undefined,
            StartDate: params.startDate ? `${params.startDate}T00:00:00Z` : undefined,
            EndDate: params.endDate ? `${params.endDate}T23:59:59Z` : undefined,
            MinPrice: params.minPrice ?? undefined,
            MaxPrice: params.maxPrice ?? undefined,
            Name: params.name || undefined,
            PageSize: 20,
        }),
        [params]
    );

    const setCity = (city: string) => setParams({ city });
    const setCategory = (category: string | null) => setParams({ category });
    const setDateRange = (start: string | null, end: string | null) =>
        setParams({ startDate: start, endDate: end });
    const setPriceRange = (min: number | null, max: number | null) =>
        setParams({ minPrice: min, maxPrice: max });
    const setName = (name: string | null) => setParams({ name });
    const resetAll = () =>
        setParams({
            city: 'Gdańsk',
            category: null,
            startDate: null,
            endDate: null,
            minPrice: null,
            maxPrice: null,
            name: null,
        });

    return {
        params,
        filters,
        setCity,
        setCategory,
        setDateRange,
        setPriceRange,
        setName,
        resetAll,
    };
};
