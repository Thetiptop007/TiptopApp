import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DeliveryTabParamList } from '../types';
import DeliveryAssignedScreen from '../screens/delivery/AssignedDeliveriesScreen';
import DeliveryMapScreen from '../screens/delivery/MapScreen';
import DeliveryHistoryScreen from '../screens/delivery/HistoryScreen';
import ProfileScreen from '../components/ProfileScreen';
import DeliveryTabBar from '../components/DeliveryTabBar';

const Tab = createBottomTabNavigator<DeliveryTabParamList>();

const DeliveryTabNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <DeliveryTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="AssignedDeliveries"
                component={DeliveryAssignedScreen}
                options={{ tabBarLabel: 'Deliveries' }}
            />
            <Tab.Screen
                name="MapView"
                component={DeliveryMapScreen}
                options={{ tabBarLabel: 'Map' }}
            />
            <Tab.Screen
                name="DeliveryHistory"
                component={DeliveryHistoryScreen}
                options={{ tabBarLabel: 'History' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ tabBarLabel: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

export default DeliveryTabNavigator;
