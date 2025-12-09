/**
 * Menu Item Adapter Utilities
 * Converts backend MenuItem format to app format
 */

import { MenuItem as BackendMenuItem, PriceVariant as BackendPriceVariant } from '../types/menu.types';
import { MenuItem as AppMenuItem, PriceVariant as AppPriceVariant } from '../types';

/**
 * Convert backend MenuItem to app MenuItem format
 * Preserves all priceVariants for proper portion selection
 */
export const adaptBackendMenuItem = (backendItem: BackendMenuItem): AppMenuItem => {
  // Get the default price (first variant or 'Full' if available)
  const defaultVariant = backendItem.priceVariants.find(v => v.quantity === 'Full') 
    || backendItem.priceVariants[0];

  // Convert all price variants
  const priceVariants: AppPriceVariant[] = backendItem.priceVariants.map(v => ({
    quantity: v.quantity as any,
    price: v.price,
  }));

  return {
    id: backendItem._id,
    name: backendItem.name,
    description: backendItem.description,
    price: defaultVariant.price, // Base price for backward compatibility
    priceVariants, // Include all variants
    category: backendItem.categories[0] || 'All',
    image: backendItem.image,
    available: backendItem.isAvailable,
    rating: backendItem.rating,
    reviews: backendItem.reviews,
    portion: defaultVariant.quantity as any,
  };
};

/**
 * Convert array of backend MenuItems to app format
 */
export const adaptBackendMenuItems = (backendItems: BackendMenuItem[]): AppMenuItem[] => {
  return backendItems.map(adaptBackendMenuItem);
};

/**
 * Get price for specific portion size
 */
export const getPriceForPortion = (
  backendItem: BackendMenuItem,
  portion: string
): number => {
  const variant = backendItem.priceVariants.find(v => v.quantity === portion);
  return variant?.price || backendItem.priceVariants[0].price;
};

/**
 * Get all available portions for an item
 */
export const getAvailablePortions = (backendItem: BackendMenuItem): string[] => {
  return backendItem.priceVariants.map(v => v.quantity);
};
