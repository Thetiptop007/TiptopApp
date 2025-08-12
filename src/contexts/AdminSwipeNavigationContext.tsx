import React, { createContext, useContext, ReactNode } from 'react';

interface AdminSwipeNavigationContextType {
    navigateToTab: (tabName: string, params?: any) => void;
    setTabParams: (tabName: string, params: any) => void;
    getTabParams: (tabName: string) => any;
}

const AdminSwipeNavigationContext = createContext<AdminSwipeNavigationContextType | undefined>(undefined);

interface AdminSwipeNavigationProviderProps {
    children: ReactNode;
    navigateToTab: (tabName: string, params?: any) => void;
}

export const AdminSwipeNavigationProvider: React.FC<AdminSwipeNavigationProviderProps> = ({
    children,
    navigateToTab,
}) => {
    // Store for tab parameters
    const tabParamsStore = React.useRef<{ [key: string]: any }>({});

    const setTabParams = (tabName: string, params: any) => {
        tabParamsStore.current[tabName] = params;
    };

    const getTabParams = (tabName: string) => {
        return tabParamsStore.current[tabName] || {};
    };

    const handleNavigateToTab = (tabName: string, params?: any) => {
        if (params) {
            setTabParams(tabName, params);
        }
        navigateToTab(tabName, params);
    };

    return (
        <AdminSwipeNavigationContext.Provider
            value={{
                navigateToTab: handleNavigateToTab,
                setTabParams,
                getTabParams,
            }}
        >
            {children}
        </AdminSwipeNavigationContext.Provider>
    );
};

export const useAdminSwipeNavigation = (): AdminSwipeNavigationContextType => {
    const context = useContext(AdminSwipeNavigationContext);
    if (!context) {
        throw new Error('useAdminSwipeNavigation must be used within AdminSwipeNavigationProvider');
    }
    return context;
};
