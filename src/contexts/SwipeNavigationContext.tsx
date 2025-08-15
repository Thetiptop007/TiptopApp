import React, { createContext, useContext, ReactNode, useState } from 'react';

interface SwipeNavigationContextType {
    navigateToTab: (tabName: string, params?: any) => void;
    navigateToOrder: (screen: 'Cart' | 'Payment' | 'OrderConfirmation' | 'OrderTracking', params?: any) => void;
    goBackToTab: () => void;
    currentTab: string;
    currentIndex: number;
    getTabParams: (tabName: string) => any;
    isOrderScreenVisible: boolean;
    currentOrderScreen: string | null;
}

const SwipeNavigationContext = createContext<SwipeNavigationContextType | undefined>(undefined);

interface SwipeNavigationProviderProps {
    children: ReactNode;
    navigateToTab: (tabName: string, params?: any) => void;
    currentTab: string;
    currentIndex: number;
}

export const SwipeNavigationProvider: React.FC<SwipeNavigationProviderProps> = ({
    children,
    navigateToTab,
    currentTab,
    currentIndex,
}) => {
    const [tabParams, setTabParams] = useState<Record<string, any>>({});
    const [isOrderScreenVisible, setIsOrderScreenVisible] = useState(false);
    const [currentOrderScreen, setCurrentOrderScreen] = useState<string | null>(null);
    const [previousTab, setPreviousTab] = useState<string>(currentTab);

    const enhancedNavigateToTab = (tabName: string, params?: any) => {
        if (params) {
            setTabParams(prev => ({ ...prev, [tabName]: params }));
        }
        setIsOrderScreenVisible(false);
        setCurrentOrderScreen(null);
        navigateToTab(tabName, params);
    };

    const navigateToOrder = (screen: 'Cart' | 'Payment' | 'OrderConfirmation' | 'OrderTracking', params?: any) => {
        setPreviousTab(currentTab);
        setCurrentOrderScreen(screen);
        setIsOrderScreenVisible(true);
        if (params) {
            setTabParams(prev => ({ ...prev, Order: { screen, ...params } }));
        } else {
            setTabParams(prev => ({ ...prev, Order: { screen } }));
        }
    };

    const goBackToTab = () => {
        setIsOrderScreenVisible(false);
        setCurrentOrderScreen(null);
        navigateToTab(previousTab);
    };

    const getTabParams = (tabName: string) => {
        return tabParams[tabName] || {};
    };

    return (
        <SwipeNavigationContext.Provider value={{
            navigateToTab: enhancedNavigateToTab,
            navigateToOrder,
            goBackToTab,
            currentTab,
            currentIndex,
            getTabParams,
            isOrderScreenVisible,
            currentOrderScreen
        }}>
            {children}
        </SwipeNavigationContext.Provider>
    );
};

export const useSwipeNavigation = (): SwipeNavigationContextType => {
    const context = useContext(SwipeNavigationContext);
    if (!context) {
        throw new Error('useSwipeNavigation must be used within a SwipeNavigationProvider');
    }
    return context;
};
