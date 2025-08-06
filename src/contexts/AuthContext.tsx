import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string, role: UserRole) => Promise<void>;
    logout: () => void;
    signUp: (name: string, email: string, password: string, phone: string, role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = async (email: string, password: string, role: UserRole) => {
        // Simulate login - in real app, make API call
        const mockUser: User = {
            id: '1',
            name: role === 'admin' ? 'Admin User' : role === 'customer' ? 'Customer User' : 'Delivery Person',
            email,
            phone: '1234567890',
            role,
            address: role === 'customer' ? '123 Main St' : undefined,
        };
        setUser(mockUser);
    };

    const logout = () => {
        setUser(null);
    };

    const signUp = async (name: string, email: string, password: string, phone: string, role: UserRole) => {
        // Simulate signup - in real app, make API call
        const newUser: User = {
            id: Date.now().toString(),
            name,
            email,
            phone,
            role,
            address: role === 'customer' ? '123 Main St' : undefined,
        };
        setUser(newUser);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
        signUp,
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
