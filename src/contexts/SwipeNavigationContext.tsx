import React, { createContext, useContext, ReactNode, useState } from 'react';

interface SwipeNavigationContextType {
    navigateToTab: (tabName: string, params?: any) => void;
    currentTab: string;
    currentIndex: number;
    getTabParams: (tabName: string) => any;
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

    const enhancedNavigateToTab = (tabName: string, params?: any) => {
        if (params) {
            setTabParams(prev => ({ ...prev, [tabName]: params }));
        }
        navigateToTab(tabName, params);
    };

    const getTabParams = (tabName: string) => {
        return tabParams[tabName] || {};
    };

    return (
        <SwipeNavigationContext.Provider value={{
            navigateToTab: enhancedNavigateToTab,
            currentTab,
            currentIndex,
            getTabParams
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
