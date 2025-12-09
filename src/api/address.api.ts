import apiClient from './client';

export interface Address {
  _id?: string;
  type: 'home' | 'work' | 'other';
  label?: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  landmark?: string;
  isDefault: boolean;
  createdAt?: string;
}

export interface AddressRequest {
  type: 'home' | 'work' | 'other';
  label?: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  landmark?: string;
  isDefault?: boolean;
}

export interface AddressResponse {
  status: string;
  message?: string;
  data: {
    address: Address;
  };
}

export interface AddressesResponse {
  status: string;
  results: number;
  data: {
    addresses: Address[];
  };
}

export const addressAPI = {
  /**
   * Get all addresses for current user
   */
  getAddresses: async (): Promise<AddressesResponse> => {
    return await apiClient.get('/addresses') as any;
  },

  /**
   * Add new address
   */
  addAddress: async (addressData: AddressRequest): Promise<AddressResponse> => {
    return await apiClient.post('/addresses', addressData) as any;
  },

  /**
   * Update existing address
   */
  updateAddress: async (addressId: string, addressData: Partial<AddressRequest>): Promise<AddressResponse> => {
    return await apiClient.patch(`/addresses/${addressId}`, addressData) as any;
  },

  /**
   * Delete address
   */
  deleteAddress: async (addressId: string): Promise<{ status: string; message: string }> => {
    return await apiClient.delete(`/addresses/${addressId}`) as any;
  },

  /**
   * Set address as default
   */
  setDefaultAddress: async (addressId: string): Promise<AddressResponse> => {
    return await apiClient.patch(`/addresses/${addressId}/default`) as any;
  },
};
