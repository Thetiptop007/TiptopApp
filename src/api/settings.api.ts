import apiClient from './client';

export interface AppSettings {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  notificationEmails: string[];
  minimumOrderAmount: number;
  taxRate: number;
  deliveryCharge: number;
  createdAt: string;
  updatedAt: string;
}

export interface SettingsResponse {
  success: boolean;
  data: {
    settings: AppSettings;
  };
}

/**
 * Fetch app settings (delivery charge, tax rate, etc.)
 */
export const settingsAPI = {
  getSettings: async (): Promise<SettingsResponse> => {
    const response = await apiClient.get<SettingsResponse>('/settings');
    // apiClient interceptor already returns response.data, so response is the data
    return response as any;
  },
};
