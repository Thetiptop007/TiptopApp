import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    BackHandler
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSwipeNavigation } from '../../../contexts/SwipeNavigationContext';

const { width } = Dimensions.get('window');

interface OrderConfirmationProps {
    orderId: string;
    estimatedDeliveryTime: number;
    totalAmount: number;
}

const OrderConfirmationScreen: React.FC<OrderConfirmationProps> = ({
    orderId = 'ORD1234',
    estimatedDeliveryTime = 35,
    totalAmount = 247.50
}) => {
    const { navigateToTab } = useSwipeNavigation();
    const slideInAnimation = useRef(new Animated.Value(width));
    const scaleAnimation = useRef(new Animated.Value(0));
    const fadeAnimation = useRef(new Animated.Value(0));

    useEffect(() => {
        // Slide in animation
        Animated.timing(slideInAnimation.current, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Scale animation for success icon
        Animated.sequence([
            Animated.timing(scaleAnimation.current, {
                toValue: 1.2,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnimation.current, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();

        // Fade in animation
        Animated.timing(fadeAnimation.current, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    // Handle hardware back button - go to Orders tab
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            handleTrackOrder();
            return true;
        });

        return () => backHandler.remove();
    }, []);

    const handleTrackOrder = () => {
        // Navigate to Orders tab to track order
        navigateToTab('Orders');
    };

    const getStepStatus = (index: number) => {
        if (index <= currentStep) return 'completed';
        if (index === currentStep + 1) return 'active';
        return 'pending';
    };

    const renderOrderStep = (step: any, index: number) => {
        const status = getStepStatus(index);
        
        return (
            <View key={step.id} style={styles.stepContainer}>
                <View style={styles.stepIndicatorContainer}>
                    <View style={[
                        styles.stepIndicator,
                        status === 'completed' && styles.stepIndicatorCompleted,
                        status === 'active' && styles.stepIndicatorActive,
                    ]}>
                        {status === 'completed' ? (
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        ) : (
                            <Ionicons 
                                name={step.icon as any} 
                                size={16} 
                                color={status === 'active' ? '#e36057ff' : '#8E8E93'} 
                            />
                        )}
                    </View>
                    {index < orderSteps.length - 1 && (
                        <View style={[
                            styles.stepConnector,
                            status === 'completed' && styles.stepConnectorCompleted,
                        ]} />
                    )}
                </View>
                
                <View style={styles.stepContent}>
                    <Text style={[
                        styles.stepTitle,
                        status === 'completed' && styles.stepTitleCompleted,
                        status === 'active' && styles.stepTitleActive,
                    ]}>
                        {step.title}
                    </Text>
                    <Text style={[
                        styles.stepSubtitle,
                        status === 'active' && styles.stepSubtitleActive,
                    ]}>
                        {step.subtitle}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <Animated.View style={[
            styles.container,
            { transform: [{ translateX: slideInAnimation.current }] }
        ]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Order Confirmed!</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                {/* Success Section */}
                <Animated.View style={[
                    styles.successSection,
                    { 
                        opacity: fadeAnimation.current,
                        transform: [{ scale: scaleAnimation.current }] 
                    }
                ]}>
                    <View style={styles.successIconContainer}>
                        <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                    </View>
                    <Text style={styles.successTitle}>Order Placed Successfully!</Text>
                    <Text style={styles.successSubtitle}>
                        Your order #{orderId} has been confirmed and is being prepared.
                    </Text>
                </Animated.View>

                {/* Delivery Info */}
                <View style={styles.deliveryInfo}>
                    <View style={styles.deliveryTimeContainer}>
                        <Ionicons name="time-outline" size={24} color="#e36057ff" />
                        <View style={styles.deliveryTimeText}>
                            <Text style={styles.deliveryTimeLabel}>Estimated Delivery</Text>
                            <Text style={styles.deliveryTime}>{estimatedDeliveryTime} minutes</Text>
                        </View>
                    </View>
                    
                    <View style={styles.orderAmountContainer}>
                        <Text style={styles.orderAmountLabel}>Order Total</Text>
                        <Text style={styles.orderAmount}>₹{totalAmount.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Order Status Info */}
                <View style={styles.statusSection}>
                    <View style={styles.statusCard}>
                        <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                        <View style={styles.statusInfo}>
                            <Text style={styles.statusTitle}>Order Confirmed</Text>
                            <Text style={styles.statusSubtitle}>Your order is being prepared by the restaurant</Text>
                        </View>
                    </View>
                    
                    <View style={styles.statusCard}>
                        <Ionicons name="restaurant" size={32} color="#e36057ff" />
                        <View style={styles.statusInfo}>
                            <Text style={styles.statusTitle}>Restaurant Notified</Text>
                            <Text style={styles.statusSubtitle}>You'll receive updates on your order status</Text>
                        </View>
                    </View>
                </View>

                {/* Info Message */}
                <View style={styles.infoBox}>
                    <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
                    <Text style={styles.infoText}>
                        Track your order status in real-time from the Orders tab
                    </Text>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Track Order Button */}
            <View style={styles.trackOrderContainer}>
                <TouchableOpacity 
                    style={styles.trackOrderButton} 
                    activeOpacity={0.8}
                    onPress={handleTrackOrder}
                >
                    <Ionicons name="navigate-outline" size={24} color="#FFFFFF" />
                    <Text style={styles.trackOrderText}>Track Your Order</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    helpButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    successSection: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#FFFFFF',
        marginBottom: 8,
    },
    successIconContainer: {
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 8,
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: 16,
        color: '#8E8E93',
        fontFamily: 'System',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 40,
    },
    deliveryInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 20,
        marginBottom: 8,
    },
    deliveryTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    deliveryTimeText: {
        marginLeft: 12,
    },
    deliveryTimeLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontFamily: 'System',
    },
    deliveryTime: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    orderAmountContainer: {
        alignItems: 'flex-end',
    },
    orderAmountLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontFamily: 'System',
    },
    orderAmount: {
        fontSize: 18,
        fontWeight: '700',
        color: '#e36057ff',
        fontFamily: 'System',
    },
    progressSection: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 20,
        marginBottom: 8,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 20,
    },
    progressContainer: {
        paddingLeft: 8,
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    stepIndicatorContainer: {
        alignItems: 'center',
        marginRight: 16,
    },
    stepIndicator: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F5F5F7',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E5E5EA',
    },
    statusSection: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 24,
        marginBottom: 12,
    },
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    statusInfo: {
        flex: 1,
        marginLeft: 16,
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 4,
    },
    statusSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        fontFamily: 'System',
        lineHeight: 18,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1976D2',
        fontFamily: 'System',
        marginLeft: 10,
        lineHeight: 18,
    },
    bottomSpacer: {
        height: 100,
    },
    trackOrderContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingBottom: 40,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    trackOrderButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e36057ff',
        borderRadius: 15,
        padding: 18,
        shadowColor: '#e36057ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    trackOrderText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'System',
        marginLeft: 8,
    },
});

export default OrderConfirmationScreen;
