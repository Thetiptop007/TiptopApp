import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Dimensions, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomerHomeScreen from '../screens/customer/main/HomeScreen';
import CustomerMenuScreen from '../screens/customer/main/MenuScreen';
import CustomerOrdersScreen from '../screens/customer/main/OrdersScreen';
import ProfileScreen from '../components/ProfileScreen';
import EditProfileScreen from '../screens/common/EditProfileScreen';
import SavedAddressesScreen from '../screens/common/SavedAddressesScreen';
import HelpSupportScreen from '../screens/common/HelpSupportScreen';
import PrivacyPolicyScreen from '../screens/common/PrivacyPolicyScreen';
import AddAddressScreen from '../screens/customer/main/AddAddressScreen';
import CustomTabBar from '../components/CustomTabBar';
import OrderNavigator from './OrderNavigator';
import { TabBarProvider } from '../contexts/TabBarContext';
import { SwipeNavigationProvider, useSwipeNavigation } from '../contexts/SwipeNavigationContext';
import { CartProvider } from '../contexts/CartContext';

const { width: screenWidth } = Dimensions.get('window');

// Core swipeable tab navigator
const SwipeableCustomerNavigator: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    const screens = useMemo(() => [
        { name: 'Home', component: CustomerHomeScreen, key: 'home' },
        { name: 'Menu', component: CustomerMenuScreen, key: 'menu' },
        { name: 'Orders', component: CustomerOrdersScreen, key: 'orders' },
        { name: 'Profile', component: ProfileScreen, key: 'profile' }
    ], []);

    const currentTabName = screens[currentIndex]?.name || 'Home';

    const handleTabPress = useCallback((routeName: string, params?: any) => {
        const targetIndex = screens.findIndex(screen => screen.name === routeName);
        if (targetIndex !== -1 && targetIndex !== currentIndex) {
            setCurrentIndex(targetIndex);
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({
                    x: targetIndex * screenWidth,
                    animated: true
                });
            }
        }
    }, [screens, currentIndex]);

    const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(offsetX / screenWidth);
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < screens.length) {
            setCurrentIndex(newIndex);
        }
    }, [currentIndex, screens.length]);

    // Mock objects for CustomTabBar
    const mockState = useMemo(() => ({
        index: currentIndex,
        routes: screens.map(screen => ({ key: screen.key, name: screen.name })),
        routeNames: screens.map(screen => screen.name),
        type: 'tab' as const,
        key: 'customer-tab',
        stale: false as const,
    }), [screens, currentIndex]);

    const mockDescriptors = useMemo(() => {
        const descriptors: Record<string, any> = {};
        screens.forEach((screen, index) => {
            descriptors[screen.key] = {
                options: {
                    tabBarLabel: screen.name,
                    tabBarIcon: ({ size, color }: { size: number; color: string }) => {
                        const iconName =
                            screen.name === 'Home' ? 'home' :
                                screen.name === 'Menu' ? 'restaurant' :
                                    screen.name === 'Orders' ? 'list' : 'person';
                        return <Ionicons name={iconName as any} size={size} color={color} />;
                    }
                },
                route: {
                    key: screen.key,
                    name: screen.name,
                },
            };
        });
        return descriptors;
    }, [screens]);

    const mockNavigation = useMemo(() => ({
        navigate: handleTabPress,
        emit: () => ({ defaultPrevented: false })
    }), [handleTabPress]);

    return (
        <SwipeNavigationProvider
            navigateToTab={handleTabPress}
            currentTab={currentTabName}
            currentIndex={currentIndex}
        >
            <CustomerNavigatorContent
                screens={screens}
                mockState={mockState}
                mockDescriptors={mockDescriptors}
                mockNavigation={mockNavigation}
                scrollViewRef={scrollViewRef}
                handleScrollEnd={handleScrollEnd}
                handleTabPress={handleTabPress}
            />
        </SwipeNavigationProvider>
    );
};

// Inner component that uses SwipeNavigationContext
const CustomerNavigatorContent: React.FC<{
    screens: any[];
    mockState: any;
    mockDescriptors: any;
    mockNavigation: any;
    scrollViewRef: React.RefObject<ScrollView | null>;
    handleScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    handleTabPress: (routeName: string, params?: any) => void;
}> = ({ screens, mockState, mockDescriptors, mockNavigation, scrollViewRef, handleScrollEnd, handleTabPress }) => {
    const { isOrderScreenVisible } = useSwipeNavigation();

    return (
        <View style={{ flex: 1 }}>
            {/* Main Tab Navigator */}
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleScrollEnd}
                    scrollEventThrottle={16}
                    bounces={false}
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                        width: screenWidth * screens.length,
                        height: '100%'
                    }}
                >
                    {screens.map((screen, index) => {
                        const Component = screen.component;
                        return (
                            <View
                                key={screen.key}
                                style={{
                                    flex: 1,
                                    width: screenWidth,
                                    backgroundColor: '#fff'
                                }}
                            >
                                <Component />
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Fixed CustomTabBar - only show when order screen is not visible */}
                {!isOrderScreenVisible && (
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        backgroundColor: '#fff',
                        elevation: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                    }}>
                        <CustomTabBar
                            state={mockState as any}
                            descriptors={mockDescriptors}
                            navigation={mockNavigation as any}
                            insets={{ top: 0, right: 0, bottom: 0, left: 0 }}
                            onTabPress={handleTabPress}
                        />
                    </View>
                )}
            </View>

            {/* Order Flow Overlay */}
            {isOrderScreenVisible && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: '#FFFFFF',
                    zIndex: 2000,
                }}>
                    <OrderNavigator />
                </View>
            )}

            {/* Profile Screens Overlay */}
            <ProfileScreensOverlay />
        </View>
    );
};

// Profile screens overlay component
const ProfileScreensOverlay: React.FC = React.memo(() => {
    const { getTabParams } = useSwipeNavigation();
    const profileParams = getTabParams('Profile') || {};
    const { screen } = profileParams;

    if (!screen) return null;

    const renderProfileScreen = () => {
        switch (screen) {
            case 'EditProfile':
                return <EditProfileScreen />;
            case 'SavedAddresses':
                return <SavedAddressesScreen />;
            case 'AddAddress':
                return <AddAddressScreen />;
            case 'HelpSupport':
                return <HelpSupportScreen />;
            case 'PrivacyPolicy':
                return <PrivacyPolicyScreen />;
            default:
                return null;
        }
    };

    return (
        <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#FFFFFF',
            zIndex: 2000,
        }}>
            {renderProfileScreen()}
        </View>
    );
});

const CustomerTabNavigator: React.FC = () => {
    return (
        <CartProvider>
            <TabBarProvider>
                <SwipeableCustomerNavigator />
            </TabBarProvider>
        </CartProvider>
    );
};

export default CustomerTabNavigator;
