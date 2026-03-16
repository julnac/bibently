import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '../services/categories.service';
import { Category } from '../types/category.types';

export const useCategories = () => {
    return useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: categoriesService.getCategories,
        staleTime: Infinity, // Categories rarely change
        gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24h
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
};
