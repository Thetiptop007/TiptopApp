import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTabBar } from '../contexts/TabBarContext';

const { width } = Dimensions.get('window');

interface DeliveryTabBarProps extends BottomTabBarProps {
    onTabPress?: (routeName: string) => void;
}

const DeliveryTabBar: React.FC<DeliveryTabBarProps> = ({ state, descriptors, navigation, onTabPress }) => {
    const { isTabBarVisible } = useTabBar();
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(translateY, {
            toValue: isTabBarVisible ? 0 : 100,
            duration: 300,
            easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
            useNativeDriver: true,
        }).start();
    }, [isTabBarVisible, translateY]);

    const getIconName = (routeName: string, focused: boolean): keyof typeof Ionicons.glyphMap => {
        switch (routeName) {
            case 'AssignedDeliveries':
                return focused ? 'bicycle' : 'bicycle-outline';
            case 'Profile':
                return focused ? 'person' : 'person-outline';
            default:
                return 'ellipse-outline';
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
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            if (onTabPress) {
                                onTabPress(route.name);
                            } else {
                                navigation.navigate(route.name, route.params);
                            }
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
                            <View style={[styles.iconContainer, isFocused && styles.iconContainerFocused]}>
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
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 1000,
        elevation: 1000,
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
            height: 6,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 0.5,
        borderColor: '#2C2C2E',
        alignSelf: 'center',
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
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
        backgroundColor: 'rgba(227, 96, 87, 0.85)',
        shadowColor: '#e36057ff',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
        transform: [{ scale: 1.02 }],
        borderRadius: 21,
    },
});

export default DeliveryTabBar;
