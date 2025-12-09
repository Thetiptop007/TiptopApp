/**
 * Authentication Types for TiptopApp
 */

export type UserRole = 'customer' | 'delivery';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isVerified: boolean;
  addresses?: Address[];
  createdAt: string;
}

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
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginResponse {
  status: 'success';
  message: string;
  data: {
    user: User;
    tokens: AuthTokens;
  };
}

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

export interface SignUpResponse {
  status: 'success';
  message: string;
  data: {
    userId: string;
    email: string;
    otpSent: boolean;
  };
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  status: 'success';
  message: string;
  data: {
    user: User;
    tokens: AuthTokens;
  };
}

export interface ResendOTPRequest {
  email: string;
}

export interface ResendOTPResponse {
  status: 'success';
  message: string;
  data: {
    otpSent: boolean;
    expiresIn: string;
  };
}

export interface LogoutResponse {
  status: 'success';
  message: string;
}

export interface UnverifiedLoginResponse {
  status: 'error';
  message: string;
  needsVerification: true;
  email: string;
}

export interface AuthError {
  status: 'error';
  message: string;
  code?: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
