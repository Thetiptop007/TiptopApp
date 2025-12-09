/**
 * Order API Service
 * Handles all order-related API calls to the backend
 */

import apiClient from './client';

export interface OrderQueryParams {
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
  [key: string]: any; // Allow dynamic keys like 'createdAt[gte]'
}

export const orderAPI = {
  /**
   * Get user's orders with filters
   * @param params Query parameters for filtering
   * @returns Promise with orders data
   */
  async getMyOrders(params: OrderQueryParams = {}): Promise<any> {
    try {
      const queryParams = new URLSearchParams();
      
      // Add all params dynamically to support MongoDB operators
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          queryParams.append(key, params[key].toString());
        }
      });

      const response = await apiClient.get(`/orders/my-orders?${queryParams.toString()}`) as any;
      return response;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  /**
   * Get order by ID
   * @param orderId Order ID
   * @returns Promise with order details
   */
  async getOrderById(orderId: string): Promise<any> {
    try {
      const response = await apiClient.get(`/orders/${orderId}`) as any;
      return response;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  /**
   * Create new order
   * @param orderData Order data
   * @returns Promise with created order
   */
  async createOrder(orderData: any): Promise<any> {
    try {
      console.log('\n🌐 API CLIENT - SENDING TO BACKEND:');
      console.log('Full orderData:', JSON.stringify(orderData, null, 2));
      console.log('First item portion:', orderData.items[0]?.portion);
      
      const response = await apiClient.post('/orders', orderData) as any;
      return response;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  /**
   * Cancel order
   * @param orderId Order ID
   * @returns Promise with cancelled order
   */
  async cancelOrder(orderId: string): Promise<any> {
    try {
      const response = await apiClient.patch(`/orders/${orderId}/cancel`) as any;
      return response;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },
};

export default orderAPI;
