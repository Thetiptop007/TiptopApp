import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { CustomerTabParamList } from '../types';
import CustomerHomeScreen from '../screens/customer/HomeScreen';
import CustomerCartScreen from '../screens/customer/CartScreen';
import CustomerOrdersScreen from '../screens/customer/OrdersScreen';
import ProfileScreen from '../components/ProfileScreen';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const CustomerTabNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Cart') {
                        iconName = focused ? 'bag' : 'bag-outline';
                    } else if (route.name === 'Orders') {
                        iconName = focused ? 'receipt' : 'receipt-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else {
                        iconName = 'ellipse-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#FF6B35',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
                tabBarLabelStyle: {
                    fontSize: 12,
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={CustomerHomeScreen}
                options={{ tabBarLabel: 'Home' }}
            />
            <Tab.Screen
                name="Cart"
                component={CustomerCartScreen}
                options={{ tabBarLabel: 'Cart' }}
            />
            <Tab.Screen
                name="Orders"
                component={CustomerOrdersScreen}
                options={{ tabBarLabel: 'Orders' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

export default CustomerTabNavigator;
