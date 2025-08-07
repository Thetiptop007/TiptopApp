import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { CustomerTabParamList } from '../types';
import CustomerHomeScreen from '../screens/customer/HomeScreen';
import CustomerMenuScreen from '../screens/customer/MenuScreen';
import CustomerOrdersScreen from '../screens/customer/OrdersScreen';
import ProfileScreen from '../components/ProfileScreen';
import CustomTabBar from '../components/CustomTabBar';
import { TabBarProvider } from '../contexts/TabBarContext';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const CustomerTabNavigator: React.FC = () => {
    return (
        <TabBarProvider>
            <Tab.Navigator
                tabBar={(props) => <CustomTabBar {...props} />}
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Tab.Screen
                    name="Home"
                    component={CustomerHomeScreen}
                    options={{ tabBarLabel: 'Home' }}
                />
                <Tab.Screen
                    name="Menu"
                    component={CustomerMenuScreen}
                    options={{ tabBarLabel: 'Menu' }}
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
        </TabBarProvider>
    );
};

export default CustomerTabNavigator;
