/**
 * Menu API Service
 * Handles all menu-related API calls to the backend
 */

import apiClient from './client';
import {
  MenuResponse,
  SingleMenuItemResponse,
  CategoriesResponse,
  MenuQueryParams,
  MenuItem,
} from '../types/menu.types';

export const menuAPI = {
  /**
   * Get all menu items with filters and pagination
   * @param params Query parameters for filtering, searching, sorting
   * @returns Promise with menu items and pagination data
   */
  async getMenuItems(params: MenuQueryParams = {}): Promise<MenuResponse> {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      
      if (params.category) queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.isAvailable !== undefined) {
        queryParams.append('isAvailable', params.isAvailable.toString());
      }
      if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
      if (params.minRating) queryParams.append('minRating', params.minRating.toString());

      const response = await apiClient.get<MenuResponse>(
        `/menu?${queryParams.toString()}`
      ) as any;
      
      return response;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  },

  /**
   * Get all available categories
   * @returns Promise with array of category names
   */
  async getCategories(): Promise<string[]> {
    try {
      const response = await apiClient.get<CategoriesResponse>('/menu/categories/all') as any;
      return response.data.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Get popular menu items
   * @param limit Number of items to fetch (default: 10)
   * @returns Promise with array of popular menu items
   */
  async getPopularItems(limit: number = 10): Promise<MenuItem[]> {
    try {
      const response = await apiClient.get(`/menu/popular/items?limit=${limit}`) as any;
      return response.data.menuItems;
    } catch (error) {
      console.error('Error fetching popular items:', error);
      throw error;
    }
  },

  /**
   * Get menu items by category
   * @param category Category name
   * @param limit Number of items to fetch (default: 20)
   * @returns Promise with array of menu items
   */
  async getItemsByCategory(category: string, limit: number = 20): Promise<MenuItem[]> {
    try {
      const response = await apiClient.get(
        `/menu/category/${encodeURIComponent(category)}?limit=${limit}`
      ) as any;
      return response.data.menuItems;
    } catch (error) {
      console.error('Error fetching items by category:', error);
      throw error;
    }
  },

  /**
   * Get single menu item by ID
   * @param id Menu item ID
   * @returns Promise with menu item details
   */
  async getMenuItem(id: string): Promise<MenuItem> {
    try {
      const response = await apiClient.get<SingleMenuItemResponse>(`/menu/${id}`) as any;
      return response.data.menuItem;
    } catch (error) {
      console.error('Error fetching menu item:', error);
      throw error;
    }
  },

  /**
   * Get menu item by slug
   * @param slug Menu item slug
   * @returns Promise with menu item details
   */
  async getMenuItemBySlug(slug: string): Promise<MenuItem> {
    try {
      const response = await apiClient.get<SingleMenuItemResponse>(
        `/menu/slug/${slug}`
      ) as any;
      return response.data.menuItem;
    } catch (error) {
      console.error('Error fetching menu item by slug:', error);
      throw error;
    }
  },

  /**
   * Search menu items
   * @param query Search query string
   * @param limit Number of results (default: 50)
   * @returns Promise with array of matching menu items
   */
  async searchMenu(query: string, limit: number = 50): Promise<MenuItem[]> {
    try {
      if (!query || query.trim().length === 0) {
        return [];
      }

      const response = await apiClient.get<MenuResponse>(
        `/menu?search=${encodeURIComponent(query)}&limit=${limit}&isAvailable=true`
      ) as any;
      
      return response.data.menuItems;
    } catch (error) {
      console.error('Error searching menu:', error);
      throw error;
    }
  },
};

export default menuAPI;
