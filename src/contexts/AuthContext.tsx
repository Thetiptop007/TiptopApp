import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage'; // AsyncStorage wrapper
import { authAPI } from '../api/auth.api';
import { User as AuthUser, AuthTokens, UserRole as AuthUserRole } from '../types/auth.types';

// Map auth types to legacy types for compatibility
type UserRole = 'customer' | 'delivery';

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    address?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ needsVerification?: boolean; email?: string }>;
    logout: () => Promise<void>;
    signUp: (name: string, email: string, password: string, phone: string, role: UserRole) => Promise<{ userId: string; email: string }>;
    verifyOTP: (email: string, otp: string) => Promise<void>;
    resendOTP: (email: string) => Promise<void>;
    checkAuth: () => Promise<void>;
    updateUser: (updatedUser: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

// Storage keys
const STORAGE_KEYS = {
    ACCESS_TOKEN: '@auth:accessToken',
    REFRESH_TOKEN: '@auth:refreshToken',
    USER_DATA: '@auth:userData',
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    console.log('[AuthContext] Provider initialized');
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication on app start
    useEffect(() => {
        console.log('[AuthContext] useEffect - Starting checkAuth');
        checkAuth();
    }, []);

    const checkAuth = async () => {
        console.log('[AuthContext] checkAuth - Starting...');
        try {
            const [accessToken, userData] = await Promise.all([
                storage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
                storage.getItem(STORAGE_KEYS.USER_DATA),
            ]);
            console.log('[AuthContext] checkAuth - Token exists:', !!accessToken);
            console.log('[AuthContext] checkAuth - UserData exists:', !!userData);

            if (accessToken && userData) {
                const parsedUser = JSON.parse(userData) as AuthUser;
                console.log('[AuthContext] checkAuth - User found:', parsedUser.email);
                setUser(mapAuthUserToUser(parsedUser));
            } else {
                console.log('[AuthContext] checkAuth - No stored auth data');
            }
        } catch (error) {
            console.error('[AuthContext] Auth check error:', error);
            await clearAuthData();
        } finally {
            console.log('[AuthContext] checkAuth - Complete, setting isLoading to false');
            setIsLoading(false);
        }
    };

    const saveAuthData = async (tokens: AuthTokens, userData: AuthUser) => {
        try {
            await Promise.all([
                storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
                storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
                storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData)),
            ]);
        } catch (error) {
            console.error('Error saving auth data:', error);
            throw new Error('Failed to save authentication data');
        }
    };

    const clearAuthData = async () => {
        try {
            await Promise.all([
                storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
                storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
                storage.removeItem(STORAGE_KEYS.USER_DATA),
            ]);
            setUser(null);
        } catch (error) {
            console.error('Error clearing auth data:', error);
        }
    };

    const mapAuthUserToUser = (authUser: AuthUser): User => {
        return {
            id: authUser._id,
            name: authUser.name,
            email: authUser.email,
            phone: authUser.phone || '',
            role: authUser.role as UserRole,
            address: authUser.addresses?.[0]?.street || undefined,
        };
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await authAPI.login({ 
                email, 
                password,
            });

            // Check if account needs verification
            if ('needsVerification' in response && response.needsVerification) {
                return { needsVerification: true, email: response.email };
            }

            // Successful login
            if ('data' in response && response.data) {
                await saveAuthData(response.data.tokens, response.data.user);
                setUser(mapAuthUserToUser(response.data.user));
                return {};
            }

            throw new Error('Invalid login response');
        } catch (error: any) {
            console.error('Login error:', error);
            throw new Error(error?.message || 'Login failed. Please try again.');
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            await clearAuthData();
        }
    };

    const signUp = async (
        name: string,
        email: string,
        password: string,
        phone: string,
        role: UserRole
    ) => {
        try {
            const response = await authAPI.signUp({
                name,
                email,
                password,
                phone,
                role: role as AuthUserRole,
            });

            if (response.data) {
                return {
                    userId: response.data.userId,
                    email: response.data.email,
                };
            }

            throw new Error('Invalid signup response');
        } catch (error: any) {
            console.error('Signup error:', error);
            throw new Error(error?.message || 'Signup failed. Please try again.');
        }
    };

    const verifyOTP = async (email: string, otp: string) => {
        try {
            const response = await authAPI.verifyOTP({ email, otp });

            if (response.data) {
                await saveAuthData(response.data.tokens, response.data.user);
                setUser(mapAuthUserToUser(response.data.user));
            } else {
                throw new Error('Invalid OTP verification response');
            }
        } catch (error: any) {
            console.error('OTP verification error:', error);
            throw new Error(error?.message || 'OTP verification failed. Please try again.');
        }
    };

    const resendOTP = async (email: string) => {
        try {
            await authAPI.resendOTP({ email });
        } catch (error: any) {
            console.error('Resend OTP error:', error);
            throw new Error(error?.message || 'Failed to resend OTP. Please try again.');
        }
    };

    const updateUser = async (updatedUser: User) => {
        try {
            setUser(updatedUser);
            await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify({
                _id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                role: updatedUser.role,
            }));
        } catch (error: any) {
            console.error('Update user error:', error);
            throw new Error('Failed to update user data');
        }
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signUp,
        verifyOTP,
        resendOTP,
        checkAuth,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
