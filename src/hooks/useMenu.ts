/**
 * useMenu Hook
 * Custom hook for fetching and managing menu data with caching and pagination
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { menuAPI } from '../api/menu.api';
import { cacheService } from '../services/cache.service';
import {
  MenuItem,
  MenuQueryParams,
  MenuPagination,
} from '../types/menu.types';

interface UseMenuReturn {
  // Data
  items: MenuItem[];
  categories: string[];
  pagination: MenuPagination | null;
  
  // Loading states
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  
  // Error state
  error: string | null;
  
  // Actions
  loadMore: () => void;
  refresh: () => void;
  setCategory: (category: string) => void;
  setSearch: (query: string) => void;
  setSortBy: (sort: string) => void;
  retryFetch: () => void;
}

export const useMenu = (): UseMenuReturn => {
  // State
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<MenuPagination | null>(null);
  
  const [queryParams, setQueryParams] = useState<MenuQueryParams>({
    page: 1,
    limit: 20,
    sort: '-rating',
    isAvailable: true,
  });

  // Refs to prevent multiple simultaneous requests
  const isFetchingRef = useRef(false);
  const categoriesFetchedRef = useRef(false);

  /**
   * Fetch menu items from API or cache
   */
  const fetchMenuItems = useCallback(async (isRefresh = false, isLoadMore = false) => {
    // Prevent concurrent requests
    if (isFetchingRef.current) {
      console.log('⚠️ Fetch already in progress, skipping...');
      return;
    }

    try {
      isFetchingRef.current = true;

      // Set appropriate loading state
      if (isRefresh) {
        setRefreshing(true);
      } else if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // Generate cache key based on query params
      const cacheKey = `menu_${JSON.stringify(queryParams)}`;
      
      // Try cache first (only on initial load, not on refresh)
      if (!isRefresh && queryParams.page === 1) {
        const cached = await cacheService.get<MenuItem[]>(cacheKey);
        if (cached && cached.length > 0) {
          console.log('📦 Using cached menu items');
          setItems(cached);
          setLoading(false);
          isFetchingRef.current = false;
          return;
        }
      }

      // Fetch from API
      console.log('🌐 Fetching menu items from API:', queryParams);
      const response = await menuAPI.getMenuItems(queryParams);
      
      const newItems = response.data.menuItems;
      console.log(`✅ Fetched ${newItems.length} menu items`);
      console.log('📊 Pagination data:', JSON.stringify(response.pagination));
      
      // Update items based on context
      if (queryParams.page === 1) {
        // First page - replace all items
        setItems(newItems);
        // Cache the first page
        await cacheService.set(cacheKey, newItems, 10 * 60 * 1000); // 10 minutes
      } else {
        // Subsequent pages - append items
        setItems(prev => {
          // Prevent duplicates
          const existingIds = new Set(prev.map(item => item._id));
          const uniqueNewItems = newItems.filter(item => !existingIds.has(item._id));
          return [...prev, ...uniqueNewItems];
        });
      }
      
      setPagination(response.pagination);
      setError(null);
    } catch (err: any) {
      console.error('❌ Menu fetch error:', err);
      const errorMessage = err?.message || 'Failed to load menu items';
      setError(errorMessage);
      
      // If refresh failed, try to use cached data
      if (isRefresh) {
        const cacheKey = `menu_${JSON.stringify({ ...queryParams, page: 1 })}`;
        const cached = await cacheService.get<MenuItem[]>(cacheKey);
        if (cached && cached.length > 0) {
          console.log('📦 Using cached data after refresh error');
          setItems(cached);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [queryParams]);

  /**
   * Fetch available categories
   */
  const fetchCategories = useCallback(async () => {
    if (categoriesFetchedRef.current) {
      return; // Already fetched
    }

    try {
      // Try cache first
      const cached = await cacheService.get<string[]>('categories');
      if (cached && cached.length > 0) {
        console.log('📦 Using cached categories');
        setCategories(['All', ...cached]);
        categoriesFetchedRef.current = true;
        return;
      }

      // Fetch from API
      console.log('🌐 Fetching categories from API');
      const cats = await menuAPI.getCategories();
      console.log(`✅ Fetched ${cats.length} categories`);
      
      setCategories(['All', ...cats]);
      await cacheService.set('categories', cats, 30 * 60 * 1000); // Cache for 30 minutes
      categoriesFetchedRef.current = true;
    } catch (err) {
      console.error('❌ Categories fetch error:', err);
      // Silently fail - not critical
    }
  }, []);

  /**
   * Load more items (pagination)
   */
  const loadMore = useCallback(() => {
    console.log('🔽 loadMore triggered - hasNextPage:', pagination?.hasNextPage, 'loading:', loading, 'loadingMore:', loadingMore, 'currentPage:', pagination?.currentPage, 'totalPages:', pagination?.totalPages);
    if (pagination?.hasNextPage && !loading && !loadingMore && !isFetchingRef.current) {
      console.log('📄 Loading page', (queryParams.page || 1) + 1);
      setQueryParams(prev => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }));
    }
  }, [pagination, loading, loadingMore, queryParams.page]);

  /**
   * Refresh data (pull to refresh)
   */
  const refresh = useCallback(() => {
    console.log('🔄 Refreshing menu...');
    setQueryParams(prev => ({ ...prev, page: 1 }));
    fetchMenuItems(true, false);
  }, [fetchMenuItems]);

  /**
   * Set category filter
   */
  const setCategory = useCallback((category: string) => {
    console.log('🏷️ Filtering by category:', category);
    setQueryParams(prev => ({
      ...prev,
      category: category === 'All' ? undefined : category,
      page: 1,
    }));
  }, []);

  /**
   * Set search query
   */
  const setSearch = useCallback((query: string) => {
    console.log('🔍 Searching for:', query);
    setQueryParams(prev => ({
      ...prev,
      search: query.trim() || undefined,
      page: 1,
    }));
  }, []);

  /**
   * Set sort order
   */
  const setSortBy = useCallback((sort: string) => {
    console.log('🔢 Sorting by:', sort);
    setQueryParams(prev => ({
      ...prev,
      sort,
      page: 1,
    }));
  }, []);

  /**
   * Retry failed fetch
   */
  const retryFetch = useCallback(() => {
    console.log('🔄 Retrying fetch...');
    setError(null);
    fetchMenuItems(false, false);
  }, [fetchMenuItems]);

  // Fetch menu items when query params change
  useEffect(() => {
    const isLoadMore = (queryParams.page || 1) > 1;
    fetchMenuItems(false, isLoadMore);
  }, [queryParams]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    // Data
    items,
    categories,
    pagination,
    
    // Loading states
    loading,
    refreshing,
    loadingMore,
    
    // Error state
    error,
    
    // Actions
    loadMore,
    refresh,
    setCategory,
    setSearch,
    setSortBy,
    retryFetch,
  };
};

export default useMenu;
