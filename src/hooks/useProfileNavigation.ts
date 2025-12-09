import { useContext } from 'react';
import { useSwipeNavigation } from '../contexts/SwipeNavigationContext';
import { useDeliverySwipeNavigation } from '../contexts/DeliverySwipeNavigationContext';

/**
 * Unified navigation hook that works with Customer and Delivery navigation contexts
 * This hook tries both contexts and returns the first available one
 */
export const useProfileNavigation = () => {
  // Try customer context first
  try {
    const navigation = useSwipeNavigation();
    if (navigation) {
      return navigation;
    }
  } catch (error) {
    // Context not available, try next
  }

  // Try delivery context
  try {
    const navigation = useDeliverySwipeNavigation();
    if (navigation) {
      return navigation;
    }
  } catch (error) {
    // Context not available
  }

  // If none available, throw error
  throw new Error('useProfileNavigation must be used within a navigation provider (Customer or Delivery)');
};
