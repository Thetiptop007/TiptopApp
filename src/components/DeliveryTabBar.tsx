import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');

interface DeliveryTabBarProps extends BottomTabBarProps {
    onTabPress?: (routeName: string) => void;
}

const DeliveryTabBar: React.FC<DeliveryTabBarProps> = ({ state, descriptors, navigation, onTabPress }) => {
    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            // Use custom onTabPress if provided (for swipe navigation)
                            if (onTabPress) {
                                onTabPress(route.name);
                            } else {
                                navigation.navigate(route.name, route.params);
                            }
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    // Get icon name based on route - delivery specific
                    const getIconName = (routeName: string, focused: boolean) => {
                        let iconName: keyof typeof Ionicons.glyphMap;

                        switch (routeName) {
                            case 'AssignedDeliveries':
                                iconName = focused ? 'list' : 'list-outline';
                                break;
                            case 'MapView':
                                iconName = focused ? 'map' : 'map-outline';
                                break;
                            case 'DeliveryHistory':
                                iconName = focused ? 'time' : 'time-outline';
                                break;
                            case 'Profile':
                                iconName = focused ? 'person' : 'person-outline';
                                break;
                            default:
                                iconName = focused ? 'ellipse' : 'ellipse-outline';
                        }
                        return iconName;
                    };

                    const iconName = getIconName(route.name, isFocused);

                    // Get delivery-specific colors
                    const getDeliveryColors = (focused: boolean) => {
                        return {
                            iconColor: focused ? '#FF6B35' : '#6B7280',
                            textColor: focused ? '#FF6B35' : '#6B7280',
                            backgroundColor: focused ? 'rgba(255, 107, 53, 0.1)' : 'transparent'
                        };
                    };

                    const colors = getDeliveryColors(isFocused);

                    return (
                        <TouchableOpacity
                            key={index}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={[
                                styles.tabItem,
                                isFocused && styles.tabItemFocused,
                                { backgroundColor: colors.backgroundColor }
                            ]}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, isFocused && styles.iconContainerFocused]}>
                                <Ionicons
                                    name={iconName}
                                    size={isFocused ? 28 : 24}
                                    color={colors.iconColor}
                                />
                                {isFocused && <View style={styles.activeIndicator} />}
                            </View>
                            <Text style={[
                                styles.tabLabel,
                                { color: colors.textColor },
                                isFocused && styles.tabLabelFocused
                            ]}>
                                {typeof label === 'string' ? label : route.name}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingTop: 15,
        paddingBottom: 30,
        paddingHorizontal: 15,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#FF6B35',
        shadowOffset: {
            width: 0,
            height: -6,
        },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 25,
        borderTopWidth: 1,
        borderTopColor: '#FFE5DB',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 15,
        marginHorizontal: 2,
    },
    tabItemFocused: {
        transform: [{ scale: 1.1 }],
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        position: 'relative',
        height: 32,
        width: 32,
    },
    iconContainerFocused: {
        // Additional styling for focused icon container if needed
    },
    activeIndicator: {
        position: 'absolute',
        bottom: -12,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FF6B35',
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
        marginTop: 2,
    },
    tabLabelFocused: {
        fontWeight: '700',
        fontSize: 11,
    },
});

export default DeliveryTabBar;
