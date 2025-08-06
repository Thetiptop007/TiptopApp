import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types';
import AuthNavigator from './AuthNavigator';
import AdminTabNavigator from './AdminTabNavigator';
import CustomerTabNavigator from './CustomerTabNavigator';
import DeliveryTabNavigator from './DeliveryTabNavigator';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
    const { isAuthenticated, user } = useAuth();

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                ) : (
                    <>
                        {user?.role === 'admin' && (
                            <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
                        )}
                        {user?.role === 'customer' && (
                            <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
                        )}
                        {user?.role === 'delivery' && (
                            <Stack.Screen name="DeliveryTabs" component={DeliveryTabNavigator} />
                        )}
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
