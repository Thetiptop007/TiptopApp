export type UserRole = 'admin' | 'customer' | 'delivery';

export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    address?: string;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image?: string;
    available: boolean;
    rating?: number;
    reviews?: number;
    portion?: 'Quarter' | 'Half' | 'Full';
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
    AdminTabs: undefined;
    CustomerTabs: undefined;
    DeliveryTabs: undefined;
};

export type AuthStackParamList = {
    Welcome: undefined;
    Login: undefined;
    SignUp: undefined;
    RoleSelection: undefined;
};

export type AdminTabParamList = {
    Dashboard: undefined;
    Orders: undefined;
    MenuManagement: undefined;
    Profile: undefined;
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
