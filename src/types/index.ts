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
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
    deliveryPersonId?: string;
    customerAddress: string;
    customerPhone: string;
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
    Cart: undefined;
    Orders: undefined;
    Profile: undefined;
};

export type DeliveryTabParamList = {
    AssignedDeliveries: undefined;
    MapView: undefined;
    DeliveryHistory: undefined;
    Profile: undefined;
};
