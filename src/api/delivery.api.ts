/**
 * Delivery Partner API Service
 * Handles all delivery-related API calls to the backend
 */

import apiClient from './client';

export const deliveryAPI = {
  /**
   * Get assigned orders for delivery partner
   * @returns Promise with assigned orders
   */
  async getAssignedOrders(): Promise<any> {
    try {
      const response = await apiClient.get('/orders/delivery/assigned') as any;
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark order as picked up
   * @param orderId Order ID
   * @returns Promise with updated order
   */
  async markOrderPickedUp(orderId: string): Promise<any> {
    try {
      const response = await apiClient.patch(`/orders/${orderId}/pickup`) as any;
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Mark order as delivered
   * @param orderId Order ID
   * @param collectedAmount Amount collected (for COD)
   * @param changeFund Change given to customer
   * @returns Promise with updated order
   */
  async markOrderDelivered(
    orderId: string,
    collectedAmount?: number,
    changeFund?: number
  ): Promise<any> {
    try {
      const response = await apiClient.patch(`/orders/${orderId}/deliver`, {
        collectedAmount,
        changeFund,
      }) as any;
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update delivery partner availability
   * @param availability Available or not
   * @returns Promise with updated availability
   */
  async updateAvailability(availability: boolean): Promise<any> {
    try {
      const response = await apiClient.patch('/delivery/availability', {
        availability,
      }) as any;
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update delivery partner location
   * @param latitude Latitude
   * @param longitude Longitude
   * @returns Promise with success status
   */
  async updateLocation(latitude: number, longitude: number): Promise<any> {
    try {
      const response = await apiClient.patch('/delivery/location', {
        latitude,
        longitude,
      }) as any;
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get delivery partner statistics
   * @returns Promise with stats data
   */
  async getMyStats(): Promise<any> {
    try {
      const response = await apiClient.get('/delivery/my-stats') as any;
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Start delivery session
   * @param openingCash Opening cash amount
   * @returns Promise with session data
   */
  async startSession(openingCash?: number): Promise<any> {
    try {
      const response = await apiClient.post('/delivery/session/start', {
        openingCash,
      }) as any;
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * End delivery session
   * @returns Promise with session data
   */
  async endSession(): Promise<any> {
    try {
      const response = await apiClient.patch('/delivery/session/end') as any;
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get app settings (including UPI ID)
   * @returns Promise with settings data
   */
  async getSettings(): Promise<any> {
    try {
      const response = await apiClient.get('/settings') as any;
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default deliveryAPI;
