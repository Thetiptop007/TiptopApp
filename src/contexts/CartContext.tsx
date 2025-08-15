import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { MenuItem, CartItem } from '../types';

interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    cartTotal: number;
    addToCart: (item: MenuItem, quantity?: number) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    getItemQuantity: (itemId: string) => number;
}

type CartAction =
    | { type: 'ADD_TO_CART'; payload: { item: MenuItem; quantity: number } }
    | { type: 'REMOVE_FROM_CART'; payload: { itemId: string } }
    | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
    | { type: 'CLEAR_CART' };

interface CartState {
    items: CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const { item, quantity } = action.payload;
            const existingItemIndex = state.items.findIndex(
                cartItem => cartItem.menuItem.id === item.id
            );

            if (existingItemIndex !== -1) {
                // Item exists, update quantity
                const updatedItems = [...state.items];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + quantity
                };
                return { items: updatedItems };
            } else {
                // New item, add to cart
                const newCartItem: CartItem = {
                    id: `cart_${item.id}_${Date.now()}`,
                    menuItem: item,
                    quantity
                };
                return { items: [...state.items, newCartItem] };
            }
        }

        case 'REMOVE_FROM_CART': {
            return {
                items: state.items.filter(item => item.menuItem.id !== action.payload.itemId)
            };
        }

        case 'UPDATE_QUANTITY': {
            const { itemId, quantity } = action.payload;
            if (quantity <= 0) {
                return {
                    items: state.items.filter(item => item.menuItem.id !== itemId)
                };
            }

            return {
                items: state.items.map(item =>
                    item.menuItem.id === itemId
                        ? { ...item, quantity }
                        : item
                )
            };
        }

        case 'CLEAR_CART': {
            return { items: [] };
        }

        default:
            return state;
    }
};

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, { items: [] });

    const addToCart = (item: MenuItem, quantity: number = 1) => {
        dispatch({ type: 'ADD_TO_CART', payload: { item, quantity } });
    };

    const removeFromCart = (itemId: string) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: { itemId } });
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const getItemQuantity = (itemId: string): number => {
        const item = state.items.find(cartItem => cartItem.menuItem.id === itemId);
        return item ? item.quantity : 0;
    };

    const cartCount = state.items.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = state.items.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems: state.items,
            cartCount,
            cartTotal,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getItemQuantity
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
