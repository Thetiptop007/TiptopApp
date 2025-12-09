import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types';
import AuthNavigator from './AuthNavigator';
import CustomerTabNavigator from './CustomerTabNavigator';
import DeliveryTabNavigator from './DeliveryTabNavigator';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
    const { isAuthenticated, user, isLoading } = useAuth();
    console.log('[AppNavigator] isLoading:', isLoading);
    console.log('[AppNavigator] isAuthenticated:', isAuthenticated);
    console.log('[AppNavigator] user role:', user?.role);

    // Show loading screen while checking authentication
    if (isLoading) {
        console.log('[AppNavigator] Showing loading screen');
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#e36057ff" />
            </View>
        );
    }

    console.log('[AppNavigator] Rendering NavigationContainer');
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                ) : (
                    <>
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

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
});

export default AppNavigator;
