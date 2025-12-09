import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, Dimensions, ScrollView, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DeliveryAssignedScreen from '../screens/delivery/AssignedDeliveriesScreen';
import DeliveryMapScreen from '../screens/delivery/MapScreen';
import DeliveryHistoryScreen from '../screens/delivery/HistoryScreen';
import ProfileScreen from '../components/ProfileScreen';
import EditProfileScreen from '../screens/common/EditProfileScreen';
import HelpSupportScreen from '../screens/common/HelpSupportScreen';
import PrivacyPolicyScreen from '../screens/common/PrivacyPolicyScreen';
import DeliveryTabBar from '../components/DeliveryTabBar';
import { TabBarProvider } from '../contexts/TabBarContext';
import { DeliverySwipeNavigationProvider, useDeliverySwipeNavigation } from '../contexts/DeliverySwipeNavigationContext';

const { width: screenWidth } = Dimensions.get('window');

// Fast and Smooth Swipeable Delivery Navigator with ScrollView
const SwipeableDeliveryNavigator: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    // Memoized screen configuration for performance - Only 2 main screens
    const screens = useMemo(() => [
        { name: 'AssignedDeliveries', component: DeliveryAssignedScreen, key: 'assigneddeliveries', label: 'Deliveries' },
        { name: 'Profile', component: ProfileScreen, key: 'profile', label: 'Profile' }
    ], []);

    // Ultra-fast tab press handler with haptic feedback and parameter support
    const handleTabPress = useCallback((routeName: string, params?: any) => {
        const targetIndex = screens.findIndex(screen => screen.name === routeName);
        if (targetIndex !== -1 && targetIndex !== currentIndex) {
            // Immediate haptic feedback for better UX
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // Update UI immediately for instant feedback
            setCurrentIndex(targetIndex);

            // Ultra-smooth scroll to target page with optimized settings
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({
                    x: targetIndex * screenWidth,
                    animated: true
                });
            }
        }
    }, [screens, currentIndex]);

    // Get current tab name
    const currentTabName = screens[currentIndex]?.name || 'AssignedDeliveries';

    // Scroll end handler - only update when scroll animation completes
    const handleScrollEnd = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(offsetX / screenWidth);

        // Only update if index actually changed and is within bounds
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < screens.length) {
            setCurrentIndex(newIndex);
            // Optional: Add subtle haptic feedback on page change
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    }, [currentIndex, screens.length]);

    // Create optimized mock state for DeliveryTabBar
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

    // Create optimized mock descriptors for delivery icons
    const mockDescriptors = useMemo(() => {
        const descriptors: any = {};
        screens.forEach((screen) => {
            descriptors[screen.key] = {
                options: {
                    tabBarLabel: screen.label,
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => {
                        const iconName = screen.name === 'AssignedDeliveries' ? 'bicycle' : 'person';
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
        <DeliverySwipeNavigationProvider
            navigateToTab={handleTabPress}
        >
            <View style={{ flex: 1, backgroundColor: '#fff' }}>
                {/* Ultra-fast ScrollView for smooth horizontal swiping */}
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleScrollEnd}
                    bounces={false}
                    decelerationRate="fast" // Faster deceleration for snappy feel
                    removeClippedSubviews={true} // Performance optimization
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

                {/* Fixed DeliveryTabBar with enhanced styling */}
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
                    <DeliveryTabBar
                        state={mockState as any}
                        descriptors={mockDescriptors}
                        navigation={mockNavigation as any}
                        insets={{ top: 0, right: 0, bottom: 0, left: 0 }}
                        onTabPress={handleTabPress}
                    />
                </View>

                {/* Profile Screens Overlay */}
                <ProfileScreensOverlay />
            </View>
        </DeliverySwipeNavigationProvider>
    );
};

// Profile screens overlay component for delivery - optimized with memo
const ProfileScreensOverlay: React.FC = React.memo(() => {
    const { getTabParams } = useDeliverySwipeNavigation();
    const profileParams = getTabParams('Profile') || {};
    const { screen } = profileParams;

    if (!screen) return null;

    const renderProfileScreen = () => {
        switch (screen) {
            case 'EditProfile':
                return <EditProfileScreen />;
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

const DeliveryTabNavigator: React.FC = () => {
    return (
        <TabBarProvider>
            <SwipeableDeliveryNavigator />
        </TabBarProvider>
    );
};

export default DeliveryTabNavigator;
