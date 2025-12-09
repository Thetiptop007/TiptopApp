/**
 * Authentication API Service
 * Handles all auth-related API calls
 */

import apiClient from './client';
import {
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  SignUpResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  ResendOTPRequest,
  ResendOTPResponse,
  LogoutResponse,
  UnverifiedLoginResponse,
} from '../types/auth.types';

export const authAPI = {
  /**
   * Sign up a new user
   * @param data User registration data
   * @returns Promise with user ID and OTP sent status
   */
  async signUp(data: SignUpRequest): Promise<SignUpResponse> {
    return await apiClient.post('/auth/register', data) as any;
  },

  /**
   * Verify email with OTP
   * @param data Email and OTP
   * @returns Promise with user data and tokens
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    return await apiClient.post('/auth/verify-otp', data) as any;
  },

  /**
   * Resend OTP to email
   * @param data Email address
   * @returns Promise with OTP sent status
   */
  async resendOTP(data: ResendOTPRequest): Promise<ResendOTPResponse> {
    return await apiClient.post('/auth/resend-otp', data) as any;
  },

  /**
   * Login user
   * @param data Email, password, and optionally role
   * @returns Promise with user data and tokens, or unverified response
   */
  async login(data: LoginRequest): Promise<LoginResponse | UnverifiedLoginResponse> {
    try {
      return await apiClient.post('/auth/login', data) as any;
    } catch (error: any) {
      // Check if it's an unverified account error
      if (error?.needsVerification) {
        return error as UnverifiedLoginResponse;
      }
      throw error;
    }
  },

  /**
   * Logout user
   * @returns Promise with logout status
   */
  async logout(): Promise<LogoutResponse> {
    return await apiClient.post('/auth/logout') as any;
  },

  /**
   * Refresh access token
   * @param refreshToken Refresh token
   * @returns Promise with new tokens
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    return await apiClient.post('/auth/refresh-token', { refreshToken }) as any;
  },

  /**
   * Get current user profile
   * @returns Promise with user data
   */
  async getMe(): Promise<{ user: any }> {
    return await apiClient.get('/auth/me') as any;
  },

  /**
   * Get user's frequently ordered items
   * @param limit Number of items to fetch (default: 10)
   * @returns Promise with frequently ordered menu items
   */
  async getFrequentlyOrdered(limit: number = 10): Promise<{ status: string; results: number; data: { items: any[] } }> {
    return await apiClient.get(`/auth/me/frequently-ordered?limit=${limit}`) as any;
  },

  /**
   * Update user profile
   * @param data Profile update data
   * @returns Promise with updated user data
   */
  async updateProfile(data: { name?: { first: string; last: string }; phone?: string }): Promise<{ status: string; data: { user: any } }> {
    return await apiClient.patch('/auth/me', data) as any;
  },

  /**
   * Change password
   * @param data Current and new password
   * @returns Promise with success message
   */
  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ status: string; message: string }> {
    return await apiClient.patch('/auth/change-password', data) as any;
  },
};

export default authAPI;
