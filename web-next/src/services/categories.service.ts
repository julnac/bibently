import apiClient from './apiClient';
import { Category } from '../types/category.types';

export const categoriesService = {

    getCategories: async (): Promise<Category[]> => {
        const response = await apiClient.get<Category[]>('/configuration/categories');
        return response.data;
    }
};