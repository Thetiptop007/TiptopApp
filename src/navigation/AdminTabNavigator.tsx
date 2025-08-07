import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AdminTabParamList } from '../types';
import AdminDashboardScreen from '../screens/admin/DashboardScreen';
import AdminOrdersScreen from '../screens/admin/OrdersScreen';
import MenuManagementScreen from '../screens/admin/MenuManagementScreen';
import ProfileScreen from '../components/ProfileScreen';
import CustomTabBar from '../components/CustomTabBar';
import { TabBarProvider } from '../contexts/TabBarContext';

const Tab = createBottomTabNavigator<AdminTabParamList>();

const AdminTabNavigator: React.FC = () => {
    return (
        <TabBarProvider>
            <Tab.Navigator
                tabBar={(props) => <CustomTabBar {...props} />}
                screenOptions={{
                    headerShown: false,
                }}
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
        </TabBarProvider>
    );
};

export default AdminTabNavigator;
