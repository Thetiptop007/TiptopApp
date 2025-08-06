export const APP_CONFIG = {
    name: 'TipTop Restaurant',
    version: '1.0.0',
    colors: {
        primary: '#FF6B35',
        secondary: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#2196F3',
        background: '#f5f5f5',
        surface: '#fff',
        text: '#333',
        textSecondary: '#666',
        textLight: '#999',
    },
    api: {
        baseUrl: 'https://api.tiptop.com', // Will be used when backend is implemented
    },
    features: {
        realTimeTracking: false, // Enable when maps integration is ready
        pushNotifications: false, // Enable when notifications are implemented
        paymentGateway: false, // Enable when payment is integrated
    },
};
