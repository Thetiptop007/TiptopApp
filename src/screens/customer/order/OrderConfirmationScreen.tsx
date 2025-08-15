import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    const [currentStep, setCurrentStep] = useState(0);
    const slideInAnimation = useRef(new Animated.Value(width));
    const scaleAnimation = useRef(new Animated.Value(0));
    const fadeAnimation = useRef(new Animated.Value(0));

    const orderSteps = [
        { id: 'placed', title: 'Order Placed', subtitle: 'Your order has been received', icon: 'checkmark-circle', completed: true },
        { id: 'confirmed', title: 'Order Confirmed', subtitle: 'Restaurant is preparing your food', icon: 'restaurant', completed: true },
        { id: 'preparing', title: 'Preparing', subtitle: 'Your delicious meal is being prepared', icon: 'flame', completed: false },
        { id: 'ready', title: 'Ready for Pickup', subtitle: 'Your order is ready for delivery', icon: 'bag-check', completed: false },
        { id: 'delivered', title: 'Delivered', subtitle: 'Enjoy your meal!', icon: 'checkmark-done', completed: false },
    ];

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
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnimation.current, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        // Fade in animation
        Animated.timing(fadeAnimation.current, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();

        // Simulate order progress updates
        const progressInterval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < orderSteps.length - 1) {
                    return prev + 1;
                }
                clearInterval(progressInterval);
                return prev;
            });
        }, 3000);

        return () => clearInterval(progressInterval);
    }, []);

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
                <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Status</Text>
                <TouchableOpacity style={styles.helpButton} activeOpacity={0.7}>
                    <Ionicons name="help-circle-outline" size={24} color="#1C1C1E" />
                </TouchableOpacity>
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

                {/* Order Progress */}
                <View style={styles.progressSection}>
                    <Text style={styles.progressTitle}>Order Progress</Text>
                    <View style={styles.progressContainer}>
                        {orderSteps.map((step, index) => renderOrderStep(step, index))}
                    </View>
                </View>

                {/* Restaurant Info */}
                <View style={styles.restaurantInfo}>
                    <View style={styles.restaurantHeader}>
                        <View style={styles.restaurantIcon}>
                            <Ionicons name="restaurant" size={24} color="#e36057ff" />
                        </View>
                        <View style={styles.restaurantDetails}>
                            <Text style={styles.restaurantName}>TipTop Restaurant</Text>
                            <Text style={styles.restaurantAddress}>Main Street, Downtown</Text>
                        </View>
                        <TouchableOpacity style={styles.callButton} activeOpacity={0.7}>
                            <Ionicons name="call" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                        <Ionicons name="refresh-outline" size={20} color="#e36057ff" />
                        <Text style={styles.actionButtonText}>Reorder</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                        <Ionicons name="receipt-outline" size={20} color="#e36057ff" />
                        <Text style={styles.actionButtonText}>View Receipt</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                        <Ionicons name="chatbubble-outline" size={20} color="#e36057ff" />
                        <Text style={styles.actionButtonText}>Help & Support</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Track Order Button */}
            <View style={styles.trackOrderContainer}>
                <TouchableOpacity style={styles.trackOrderButton} activeOpacity={0.8}>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
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
    stepIndicatorCompleted: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    stepIndicatorActive: {
        backgroundColor: '#FFF3F0',
        borderColor: '#e36057ff',
    },
    stepConnector: {
        width: 2,
        height: 40,
        backgroundColor: '#E5E5EA',
        marginTop: 4,
    },
    stepConnectorCompleted: {
        backgroundColor: '#4CAF50',
    },
    stepContent: {
        flex: 1,
        paddingBottom: 24,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8E8E93',
        fontFamily: 'System',
        marginBottom: 4,
    },
    stepTitleCompleted: {
        color: '#1C1C1E',
    },
    stepTitleActive: {
        color: '#e36057ff',
        fontWeight: '700',
    },
    stepSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        fontFamily: 'System',
        lineHeight: 18,
    },
    stepSubtitleActive: {
        color: '#1C1C1E',
    },
    restaurantInfo: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 20,
        marginBottom: 8,
    },
    restaurantHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    restaurantIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF3F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    restaurantDetails: {
        flex: 1,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 2,
    },
    restaurantAddress: {
        fontSize: 14,
        color: '#8E8E93',
        fontFamily: 'System',
    },
    callButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e36057ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickActions: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 20,
        marginBottom: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    actionButtonText: {
        fontSize: 16,
        color: '#1C1C1E',
        fontFamily: 'System',
        marginLeft: 16,
        fontWeight: '500',
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
