import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTabBar } from '../contexts/TabBarContext';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    const { isTabBarVisible } = useTabBar();
    const translateY = useRef(new Animated.Value(0)).current; // Start visible (0px position)

    useEffect(() => {
        Animated.timing(translateY, {
            toValue: isTabBarVisible ? 0 : 100,
            duration: 300,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // Smooth easing curve
            useNativeDriver: true,
        }).start();
    }, [isTabBarVisible, translateY]);
    const getIconName = (routeName: string, focused: boolean): keyof typeof Ionicons.glyphMap => {
        switch (routeName) {
            // Admin routes
            case 'Dashboard':
                return focused ? 'grid' : 'grid-outline';
            case 'Orders':
                return focused ? 'receipt' : 'receipt-outline';
            case 'MenuManagement':
                return focused ? 'restaurant' : 'restaurant-outline';
            case 'Profile':
                return focused ? 'person' : 'person-outline';

            // Customer routes
            case 'Home':
                return focused ? 'home' : 'home-outline';
            case 'Search':
                return focused ? 'search' : 'search-outline';
            case 'Cart':
                return 'bag-add';
            case 'Favorites':
                return focused ? 'heart' : 'heart-outline';

            // Delivery routes
            case 'AssignedDeliveries':
                return focused ? 'list' : 'list-outline';
            case 'MapView':
                return focused ? 'map' : 'map-outline';
            case 'DeliveryHistory':
                return focused ? 'time' : 'time-outline';

            default:
                return 'ellipse-outline';
        }
    };

    const getLabel = (routeName: string): string => {
        switch (routeName) {
            case 'Dashboard': return 'Dashboard';
            case 'Orders': return 'Orders';
            case 'MenuManagement': return 'Menu';
            case 'Profile': return 'Profile';
            case 'Home': return 'Home';
            case 'Search': return 'Search';
            case 'Cart': return 'Cart';
            case 'Favorites': return 'Favorites';
            case 'AssignedDeliveries': return 'Deliveries';
            case 'MapView': return 'Map';
            case 'DeliveryHistory': return 'History';
            default: return routeName;
        }
    };

    return (
        <Animated.View style={[
            styles.container,
            {
                transform: [{ translateY }],
            }
        ]}>
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = getLabel(route.name);
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const iconName = getIconName(route.name, isFocused);

                    return (
                        <TouchableOpacity
                            key={index}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            onPress={onPress}
                            style={styles.tabItem}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.iconContainer,
                                isFocused && styles.iconContainerFocused
                            ]}>
                                <Ionicons
                                    name={iconName}
                                    size={20}
                                    color={isFocused ? '#FFFFFF' : '#8E8E93'}
                                />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 30 : 18,
        left: 14,
        right: 14,
        alignItems: 'center',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#1C1C1E',
        borderRadius: 25,
        paddingHorizontal: 10,
        paddingVertical: 6,
        alignItems: 'center',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 6
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 0.5,
        borderColor: '#2C2C2E',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 3,
    },
    iconContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    iconContainerFocused: {
        backgroundColor: 'rgba(255, 107, 53, 0.85)',
        shadowColor: '#FF6B35',
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
        transform: [{ scale: 1.02 }],
        borderRadius: 21,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
        color: '#8E8E93',
        marginTop: 1,
        fontFamily: 'System',
    },
    tabLabelFocused: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontFamily: 'System',
    },
});

export default CustomTabBar;