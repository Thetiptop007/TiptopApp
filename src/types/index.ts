export type UserRole = 'customer' | 'delivery';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    address?: string;
}

export type PortionSize = 'Quarter' | 'Half' | 'Full' | '2PCS' | '4PCS' | '8PCS' | '16PCS';

export interface PriceVariant {
    quantity: PortionSize;
    price: number;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number; // Default/base price for backward compatibility
    priceVariants?: PriceVariant[]; // Optional array of price variants
    category: string;
    image?: string;
    available: boolean;
    rating?: number;
    reviews?: number;
    portion?: PortionSize; // Selected portion
}

export interface CartItem {
    id: string;
    menuItem: MenuItem;
    quantity: number;
}

export interface Order {
    id: string;
    customerId: string;
    items: CartItem[];
    total: number;
    status: 'PENDING' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
    paymentStatus: 'PENDING' | 'PAID' | 'COLLECTED';
    paymentMethod: 'ONLINE' | 'COD';
    deliveryPersonId?: string;
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    codAmount?: number;
    codHandlingFee?: number;
    discount?: number;
    deliveryFee?: number;
    platformFee?: number;
    cashToCollect?: number;
    cashCollected?: number;
    cashCollectionTime?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface DeliveryPerson {
    id: string;
    name: string;
    phone: string;
    email: string;
    isAvailable: boolean;
    currentOrders: string[];
}

export type RootStackParamList = {
    Auth: undefined;
    CustomerTabs: undefined;
    DeliveryTabs: undefined;
};

export type AuthStackParamList = {
    Welcome: undefined;
    Login: undefined;
    SignUp: undefined;
    RoleSelection: undefined;
    VerifyOTP: { email: string; fromSignup?: boolean };
};

export type CustomerTabParamList = {
    Home: undefined;
    Menu: { searchQuery?: string; fromSearch?: boolean } | undefined;
    Orders: undefined;
    Profile: undefined;
};

export type DeliveryTabParamList = {
    AssignedDeliveries: undefined;
    MapView: undefined;
    DeliveryHistory: undefined;
    Profile: undefined;
};
