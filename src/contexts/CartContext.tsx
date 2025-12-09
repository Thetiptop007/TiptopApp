import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { MenuItem, CartItem, PortionSize } from '../types';

interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    cartTotal: number;
    addToCart: (item: MenuItem, quantity?: number) => void;
    removeFromCart: (itemId: string, portion?: PortionSize) => void;
    updateQuantity: (itemId: string, quantity: number, portion?: PortionSize) => void;
    clearCart: () => void;
    getItemQuantity: (itemId: string, portion?: PortionSize) => number;
}

type CartAction =
    | { type: 'ADD_TO_CART'; payload: { item: MenuItem; quantity: number } }
    | { type: 'REMOVE_FROM_CART'; payload: { itemId: string; portion?: PortionSize } }
    | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number; portion?: PortionSize } }
    | { type: 'CLEAR_CART' };

interface CartState {
    items: CartItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const { item, quantity } = action.payload;
            // Use itemId + portion to uniquely identify cart items
            const existingItemIndex = state.items.findIndex(
                cartItem => cartItem.menuItem.id === item.id && cartItem.menuItem.portion === item.portion
            );

            if (existingItemIndex !== -1) {
                // Item with same portion exists, update quantity
                const updatedItems = [...state.items];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + quantity
                };
                return { items: updatedItems };
            } else {
                // New item (or different portion), add to cart
                const newCartItem: CartItem = {
                    id: `cart_${item.id}_${item.portion}_${Date.now()}`,
                    menuItem: item,
                    quantity
                };
                return { items: [...state.items, newCartItem] };
            }
        }

        case 'REMOVE_FROM_CART': {
            const { itemId, portion } = action.payload;
            return {
                items: state.items.filter(item => 
                    !(item.menuItem.id === itemId && 
                      (portion === undefined || item.menuItem.portion === portion))
                )
            };
        }

        case 'UPDATE_QUANTITY': {
            const { itemId, quantity, portion } = action.payload;
            if (quantity <= 0) {
                return {
                    items: state.items.filter(item => 
                        !(item.menuItem.id === itemId && 
                          (portion === undefined || item.menuItem.portion === portion))
                    )
                };
            }

            return {
                items: state.items.map(item =>
                    item.menuItem.id === itemId && 
                    (portion === undefined || item.menuItem.portion === portion)
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

    const removeFromCart = (itemId: string, portion?: PortionSize) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: { itemId, portion } });
    };

    const updateQuantity = (itemId: string, quantity: number, portion?: PortionSize) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity, portion } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const getItemQuantity = (itemId: string, portion?: PortionSize): number => {
        const item = state.items.find(cartItem => 
            cartItem.menuItem.id === itemId && 
            (portion === undefined || cartItem.menuItem.portion === portion)
        );
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
