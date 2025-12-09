import React, { createContext, useContext, ReactNode } from 'react';

interface DeliverySwipeNavigationContextType {
    navigateToTab: (tabName: string, params?: any) => void;
    setTabParams: (tabName: string, params: any) => void;
    getTabParams: (tabName: string) => any;
}

const DeliverySwipeNavigationContext = createContext<DeliverySwipeNavigationContextType | undefined>(undefined);

interface DeliverySwipeNavigationProviderProps {
    children: ReactNode;
    navigateToTab: (tabName: string, params?: any) => void;
}

export const DeliverySwipeNavigationProvider: React.FC<DeliverySwipeNavigationProviderProps> = ({
    children,
    navigateToTab,
}) => {
    // Store for tab parameters - using state for reactivity
    const [tabParamsStore, setTabParamsStore] = React.useState<{ [key: string]: any }>({});

    const setTabParams = (tabName: string, params: any) => {
        setTabParamsStore(prev => ({
            ...prev,
            [tabName]: params
        }));
    };

    const getTabParams = (tabName: string) => {
        return tabParamsStore[tabName] || {};
    };

    const handleNavigateToTab = (tabName: string, params?: any) => {
        if (params) {
            setTabParams(tabName, params);
        }
        navigateToTab(tabName, params);
    };

    return (
        <DeliverySwipeNavigationContext.Provider
            value={{
                navigateToTab: handleNavigateToTab,
                setTabParams,
                getTabParams,
            }}
        >
            {children}
        </DeliverySwipeNavigationContext.Provider>
    );
};

export const useDeliverySwipeNavigation = (): DeliverySwipeNavigationContextType => {
    const context = useContext(DeliverySwipeNavigationContext);
    if (!context) {
        throw new Error('useDeliverySwipeNavigation must be used within DeliverySwipeNavigationProvider');
    }
    return context;
};
