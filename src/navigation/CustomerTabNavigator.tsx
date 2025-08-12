import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Dimensions, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomerHomeScreen from '../screens/customer/HomeScreen';
import CustomerMenuScreen from '../screens/customer/MenuScreen';
import CustomerOrdersScreen from '../screens/customer/OrdersScreen';
import ProfileScreen from '../components/ProfileScreen';
import CustomTabBar from '../components/CustomTabBar';
import { TabBarProvider } from '../contexts/TabBarContext';
import { SwipeNavigationProvider } from '../contexts/SwipeNavigationContext';

const { width: screenWidth } = Dimensions.get('window');

// Fast and Smooth Swipeable Customer Navigator with ScrollView
const SwipeableCustomerNavigator: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    // Memoized screen configuration for performance
    const screens = useMemo(() => [
        { name: 'Home', component: CustomerHomeScreen, key: 'home' },
        { name: 'Menu', component: CustomerMenuScreen, key: 'menu' },
        { name: 'Orders', component: CustomerOrdersScreen, key: 'orders' },
        { name: 'Profile', component: ProfileScreen, key: 'profile' }
    ], []);

    // Ultra-fast tab press handler with parameter support
    const handleTabPress = useCallback((routeName: string, params?: any) => {
        const targetIndex = screens.findIndex(screen => screen.name === routeName);
        if (targetIndex !== -1 && targetIndex !== currentIndex) {
            // Update UI immediately for instant feedback
            setCurrentIndex(targetIndex);

            // Smooth scroll to target page
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({
                    x: targetIndex * screenWidth,
                    animated: true
                });
            }
        }
    }, [screens, currentIndex]);

    // Get current tab name
    const currentTabName = screens[currentIndex]?.name || 'Home';

    // Handle scroll completion to update current index
    const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(offsetX / screenWidth);
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < screens.length) {
            setCurrentIndex(newIndex);
        }
    }, [currentIndex, screens.length]);

    // Create optimized mock state for CustomTabBar
    const mockState = useMemo(() => ({
        index: currentIndex,
        routeNames: screens.map(s => s.name),
        routes: screens.map((screen, index) => ({
            key: screen.key,
            name: screen.name,
            index,
        })),
        stale: false,
        type: 'tab' as const,
    }), [currentIndex, screens]);

    // Create optimized mock descriptors
    const mockDescriptors = useMemo(() => {
        const descriptors: any = {};
        screens.forEach((screen) => {
            // Use screen.key (which matches route.key in the state) instead of screen.name
            descriptors[screen.key] = {
                options: {
                    tabBarLabel: screen.name,
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => {
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
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                {/* ScrollView for smooth horizontal swiping */}
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

                {/* Fixed CustomTabBar */}
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
            </View>
        </SwipeNavigationProvider>
    );
};

const CustomerTabNavigator: React.FC = () => {
    return (
        <TabBarProvider>
            <SwipeableCustomerNavigator />
        </TabBarProvider>
    );
};

export default CustomerTabNavigator;
