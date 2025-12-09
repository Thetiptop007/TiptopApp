/**
 * Menu-related TypeScript types for TiptopApp
 * Aligned with Backend MenuItem model
 */

export type PortionSize = 'Quarter' | 'Half' | 'Full' | '2PCS' | '4PCS' | '8PCS' | '16PCS';

export interface PriceVariant {
  quantity: PortionSize;
  price: number;
}

export interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  priceVariants: PriceVariant[];
  categories: string[];
  rating: number;
  reviews: number;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface MenuResponse {
  status: 'success';
  results: number;
  pagination: MenuPagination;
  data: {
    menuItems: MenuItem[];
  };
}

export interface SingleMenuItemResponse {
  status: 'success';
  data: {
    menuItem: MenuItem;
  };
}

export interface CategoriesResponse {
  status: 'success';
  results: number;
  data: {
    categories: string[];
  };
}

export interface MenuQueryParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  isAvailable?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export interface MenuFilters {
  category: string;
  search: string;
  sortBy: 'name' | 'price' | 'rating' | '-rating' | '-createdAt';
  priceRange?: { min: number; max: number };
  minRating?: number;
}
