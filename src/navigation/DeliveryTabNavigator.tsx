import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { DeliveryTabParamList } from '../types';
import DeliveryAssignedScreen from '../screens/delivery/AssignedDeliveriesScreen';
import DeliveryMapScreen from '../screens/delivery/MapScreen';
import DeliveryHistoryScreen from '../screens/delivery/HistoryScreen';
import ProfileScreen from '../components/ProfileScreen';

const Tab = createBottomTabNavigator<DeliveryTabParamList>();

const DeliveryTabNavigator: React.FC = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'AssignedDeliveries') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'MapView') {
                        iconName = focused ? 'map' : 'map-outline';
                    } else if (route.name === 'DeliveryHistory') {
                        iconName = focused ? 'time' : 'time-outline';
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
