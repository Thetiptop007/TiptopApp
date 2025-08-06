import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AdminTabParamList } from '../types';
import AdminDashboardScreen from '../screens/admin/DashboardScreen';
import AdminOrdersScreen from '../screens/admin/OrdersScreen';
import MenuManagementScreen from '../screens/admin/MenuManagementScreen';
import ProfileScreen from '../components/ProfileScreen';

const Tab = createBottomTabNavigator<AdminTabParamList>();

const AdminTabNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }: { route: { name: string } }) => ({
                tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Orders') {
                        iconName = focused ? 'receipt' : 'receipt-outline';
                    } else if (route.name === 'MenuManagement') {
                        iconName = focused ? 'restaurant' : 'restaurant-outline';
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
                name="Dashboard"
                component={AdminDashboardScreen}
                options={{ tabBarLabel: 'Dashboard' }}
            />
            <Tab.Screen
                name="Orders"
                component={AdminOrdersScreen}
                options={{ tabBarLabel: 'Orders' }}
            />
            <Tab.Screen
                name="MenuManagement"
                component={MenuManagementScreen}
                options={{ tabBarLabel: 'Menu' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

export default AdminTabNavigator;
