import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSwipeNavigation } from '../contexts/SwipeNavigationContext';
import CartScreen from '../screens/customer/order/CartScreen';
import PaymentScreen from '../screens/customer/order/PaymentScreen';
import OrderConfirmationScreen from '../screens/customer/order/OrderConfirmationScreen';
import OrderTrackingScreen from '../screens/customer/order/OrderTrackingScreen';

// Order flow screens that are shown as modals without tab bar
const OrderNavigator: React.FC = () => {
    const { getTabParams } = useSwipeNavigation();
    const orderScreenParams = getTabParams('Order') || {};
    const { screen = 'Cart', ...screenProps } = orderScreenParams;

    const renderOrderScreen = () => {
        switch (screen) {
            case 'Cart':
                return <CartScreen />;
            case 'Payment':
                return <PaymentScreen />;
            case 'OrderConfirmation':
                return (
                    <OrderConfirmationScreen
                        orderId={screenProps.orderId || "ORD-2024-001"}
                        estimatedDeliveryTime={screenProps.estimatedDeliveryTime || 30}
                        totalAmount={screenProps.totalAmount || 399}
                    />
                );
            case 'OrderTracking':
                return (
                    <OrderTrackingScreen
                        orderId={screenProps.orderId || "ORD-2024-001"}
                        deliveryPersonName={screenProps.deliveryPersonName || "Rajesh Kumar"}
                        deliveryPersonPhone={screenProps.deliveryPersonPhone || "+91 9876543210"}
                        estimatedTime={screenProps.estimatedTime || 25}
                    />
                );
            default:
                return <CartScreen />;
        }
    };

    return (
        <View style={styles.container}>
            {renderOrderScreen()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
});

export default OrderNavigator;
