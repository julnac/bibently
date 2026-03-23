'use client';

import { useQueryStates, parseAsString, parseAsInteger, parseAsFloat } from 'nuqs';
import { useMemo } from 'react';
import { EventQueryParams } from '../types/event.params';
import { EventSortableAccessor } from '../types/event.types';
import { SortDirection } from '../types/api.types';

export const useSearchFilters = () => {
    const [params, setParams] = useQueryStates({
        city: parseAsString,
        name: parseAsString,
        category: parseAsString,
        startDate: parseAsString,
        endDate: parseAsString,
        minPrice: parseAsInteger,
        maxPrice: parseAsInteger,
        latitude: parseAsFloat,
        longitude: parseAsFloat,
        radiusKm: parseAsInteger,
        sortKey: parseAsString,
        order: parseAsString
    });

    const filters: EventQueryParams = useMemo(
        () => ({
            city: params.city || undefined,
            name: params.name || undefined,
            category: params.category || undefined,
            startDate: params.startDate ? `${params.startDate}T00:00:00Z` : undefined,
            endDate: params.endDate ? `${params.endDate}T23:59:59Z` : undefined,
            minPrice: params.minPrice ?? undefined,
            maxPrice: params.maxPrice ?? undefined,
            latitude: params.latitude || undefined,
            longitude: params.longitude || undefined,
            radiusKm: params.radiusKm || undefined,
            sortKey: params.sortKey as EventSortableAccessor || undefined,
            order: params.order as SortDirection || undefined,
            pageSize: 20,
        }),
        [params]
    );

    const setCity = (city: string | null) => setParams({ city });
    const setCategory = (category: string | null) => setParams({ category });
    const setDateRange = (start: string | null, end: string | null) =>
        setParams({ startDate: start, endDate: end });
    const setPriceRange = (min: number | null, max: number | null) =>
        setParams({ minPrice: min, maxPrice: max });
    const setName = (name: string | null) => setParams({ name });
    const setSorting = (sortKey: EventSortableAccessor | null, order: SortDirection | null) =>
        setParams({ sortKey, order });
    const setLocation = (latitude: number | null, longitude: number | null, radiusKm: number | null) =>
        setParams({ latitude, longitude, radiusKm });
    const resetAll = () =>
        setParams({
            city: null,
            name: null,
            category: null,
            startDate: null,
            endDate: null,
            minPrice: null,
            maxPrice: null,
            latitude: null,
            longitude: null,
            radiusKm: null,
            sortKey: null,
            order: null,
        });

    return {
        params,
        filters,
        setCity,
        setCategory,
        setDateRange,
        setPriceRange,
        setName,
        setSorting,
        setLocation,
        resetAll,
    };
};
