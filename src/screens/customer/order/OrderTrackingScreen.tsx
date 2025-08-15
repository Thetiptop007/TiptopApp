import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface OrderTrackingProps {
    orderId: string;
    deliveryPersonName?: string;
    deliveryPersonPhone?: string;
    estimatedTime?: number;
}

const OrderTrackingScreen: React.FC<OrderTrackingProps> = ({
    orderId = 'ORD1234',
    deliveryPersonName = 'Raj Kumar',
    deliveryPersonPhone = '+91 98765 43210',
    estimatedTime = 15
}) => {
    const [currentStatus, setCurrentStatus] = useState('out_for_delivery');
    const [timeRemaining, setTimeRemaining] = useState(estimatedTime);
    const slideInAnimation = useRef(new Animated.Value(width));
    const pulseAnimation = useRef(new Animated.Value(1));

    const statusSteps = [
        { 
            id: 'confirmed', 
            title: 'Order Confirmed', 
            subtitle: 'Restaurant has confirmed your order',
            icon: 'checkmark-circle',
            time: '2:30 PM',
            completed: true 
        },
        { 
            id: 'preparing', 
            title: 'Food Being Prepared', 
            subtitle: 'Chef is preparing your delicious meal',
            icon: 'flame',
            time: '2:45 PM',
            completed: true 
        },
        { 
            id: 'ready', 
            title: 'Ready for Pickup', 
            subtitle: 'Your order is packed and ready',
            icon: 'bag-check',
            time: '3:10 PM',
            completed: true 
        },
        { 
            id: 'out_for_delivery', 
            title: 'Out for Delivery', 
            subtitle: `${deliveryPersonName} is on the way`,
            icon: 'bicycle',
            time: '3:20 PM',
            completed: true,
            active: true 
        },
        { 
            id: 'delivered', 
            title: 'Delivered', 
            subtitle: 'Enjoy your meal!',
            icon: 'checkmark-done-circle',
            time: '',
            completed: false 
        },
    ];

    useEffect(() => {
        // Slide in animation
        Animated.timing(slideInAnimation.current, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Pulse animation for active status
        const pulseLoop = () => {
            Animated.sequence([
                Animated.timing(pulseAnimation.current, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnimation.current, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]).start(pulseLoop);
        };
        pulseLoop();

        // Timer countdown
        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev > 0) {
                    return prev - 1;
                }
                clearInterval(timer);
                return 0;
            });
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    const callDeliveryPerson = () => {
        Alert.alert(
            'Call Delivery Person',
            `Call ${deliveryPersonName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', onPress: () => console.log(`Calling ${deliveryPersonPhone}`) }
            ]
        );
    };

    const renderTrackingStep = (step: any, index: number) => {
        return (
            <View key={step.id} style={styles.stepContainer}>
                <View style={styles.stepIndicatorContainer}>
                    <Animated.View style={[
                        styles.stepIndicator,
                        step.completed && styles.stepIndicatorCompleted,
                        step.active && styles.stepIndicatorActive,
                        step.active && { transform: [{ scale: pulseAnimation.current }] }
                    ]}>
                        <Ionicons 
                            name={step.icon as any} 
                            size={step.active ? 20 : 16} 
                            color={step.completed || step.active ? '#FFFFFF' : '#8E8E93'} 
                        />
                    </Animated.View>
                    {index < statusSteps.length - 1 && (
                        <View style={[
                            styles.stepConnector,
                            step.completed && styles.stepConnectorCompleted,
                        ]} />
                    )}
                </View>
                
                <View style={styles.stepContent}>
                    <View style={styles.stepHeader}>
                        <Text style={[
                            styles.stepTitle,
                            (step.completed || step.active) && styles.stepTitleActive,
                        ]}>
                            {step.title}
                        </Text>
                        {step.time && (
                            <Text style={styles.stepTime}>{step.time}</Text>
                        )}
                    </View>
                    <Text style={[
                        styles.stepSubtitle,
                        step.active && styles.stepSubtitleActive,
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
                <Text style={styles.headerTitle}>Track Order</Text>
                <TouchableOpacity style={styles.shareButton} activeOpacity={0.7}>
                    <Ionicons name="share-outline" size={24} color="#1C1C1E" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                {/* Delivery Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <View style={styles.statusIcon}>
                            <Ionicons name="bicycle" size={32} color="#e36057ff" />
                        </View>
                        <View style={styles.statusInfo}>
                            <Text style={styles.statusTitle}>Order #{orderId}</Text>
                            <Text style={styles.statusSubtitle}>
                                Arriving in {timeRemaining} minutes
                            </Text>
                        </View>
                        <View style={styles.estimatedTimeContainer}>
                            <Text style={styles.estimatedTimeLabel}>ETA</Text>
                            <Text style={styles.estimatedTime}>
                                {new Date(Date.now() + timeRemaining * 60000).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Delivery Person Info */}
                <View style={styles.deliveryPersonCard}>
                    <View style={styles.deliveryPersonHeader}>
                        <View style={styles.deliveryPersonAvatar}>
                            <Ionicons name="person" size={24} color="#e36057ff" />
                        </View>
                        <View style={styles.deliveryPersonInfo}>
                            <Text style={styles.deliveryPersonName}>{deliveryPersonName}</Text>
                            <Text style={styles.deliveryPersonRole}>Delivery Partner</Text>
                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={14} color="#FFD700" />
                                <Text style={styles.rating}>4.8</Text>
                                <Text style={styles.reviews}>(1.2k reviews)</Text>
                            </View>
                        </View>
                        <TouchableOpacity 
                            style={styles.callButton} 
                            onPress={callDeliveryPerson}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="call" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Live Tracking Map Placeholder */}
                <View style={styles.mapContainer}>
                    <View style={styles.mapPlaceholder}>
                        <Ionicons name="map-outline" size={40} color="#8E8E93" />
                        <Text style={styles.mapPlaceholderText}>Live Tracking Map</Text>
                        <Text style={styles.mapPlaceholderSubtext}>
                            Real-time location updates
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.viewFullMapButton} activeOpacity={0.7}>
                        <Text style={styles.viewFullMapText}>View Full Map</Text>
                        <Ionicons name="arrow-forward" size={16} color="#e36057ff" />
                    </TouchableOpacity>
                </View>

                {/* Order Progress */}
                <View style={styles.progressSection}>
                    <Text style={styles.progressTitle}>Order Progress</Text>
                    <View style={styles.progressContainer}>
                        {statusSteps.map((step, index) => renderTrackingStep(step, index))}
                    </View>
                </View>

                {/* Delivery Address */}
                <View style={styles.addressSection}>
                    <Text style={styles.addressTitle}>Delivery Address</Text>
                    <View style={styles.addressContainer}>
                        <Ionicons name="location" size={24} color="#e36057ff" />
                        <View style={styles.addressInfo}>
                            <Text style={styles.addressText}>
                                123 Main Street, Apartment 4B{'\n'}
                                Downtown, Mumbai 400001
                            </Text>
                            <TouchableOpacity style={styles.changeAddressButton} activeOpacity={0.7}>
                                <Text style={styles.changeAddressText}>Change Address</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Order Details */}
                <View style={styles.orderDetailsSection}>
                    <Text style={styles.orderDetailsTitle}>Order Details</Text>
                    <View style={styles.orderItem}>
                        <Text style={styles.orderItemName}>2x Butter Chicken</Text>
                        <Text style={styles.orderItemPrice}>₹25.98</Text>
                    </View>
                    <View style={styles.orderItem}>
                        <Text style={styles.orderItemName}>1x Garlic Naan</Text>
                        <Text style={styles.orderItemPrice}>₹3.99</Text>
                    </View>
                    <View style={styles.orderItem}>
                        <Text style={styles.orderItemName}>1x Basmati Rice</Text>
                        <Text style={styles.orderItemPrice}>₹3.99</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.orderTotal}>
                        <Text style={styles.orderTotalLabel}>Total Amount</Text>
                        <Text style={styles.orderTotalValue}>₹247.50</Text>
                    </View>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
                <TouchableOpacity style={styles.helpButton} activeOpacity={0.7}>
                    <Ionicons name="chatbubble-outline" size={20} color="#e36057ff" />
                    <Text style={styles.helpButtonText}>Help & Support</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.cancelButton} activeOpacity={0.7}>
                    <Ionicons name="close-circle-outline" size={20} color="#F44336" />
                    <Text style={styles.cancelButtonText}>Cancel Order</Text>
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
    shareButton: {
        padding: 8,
    },
    content: {
        flex: 1,
    },
    statusCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginVertical: 10,
        borderRadius: 15,
        padding: 20,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFF3F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    statusInfo: {
        flex: 1,
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
    },
    estimatedTimeContainer: {
        alignItems: 'center',
        backgroundColor: '#FFF3F0',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    estimatedTimeLabel: {
        fontSize: 12,
        color: '#e36057ff',
        fontFamily: 'System',
        fontWeight: '600',
    },
    estimatedTime: {
        fontSize: 16,
        fontWeight: '700',
        color: '#e36057ff',
        fontFamily: 'System',
    },
    deliveryPersonCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 15,
        padding: 20,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    deliveryPersonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deliveryPersonAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF3F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    deliveryPersonInfo: {
        flex: 1,
    },
    deliveryPersonName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 2,
    },
    deliveryPersonRole: {
        fontSize: 14,
        color: '#8E8E93',
        fontFamily: 'System',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rating: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginLeft: 4,
    },
    reviews: {
        fontSize: 12,
        color: '#8E8E93',
        fontFamily: 'System',
        marginLeft: 4,
    },
    callButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e36057ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    mapPlaceholder: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F7',
    },
    mapPlaceholderText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginTop: 12,
    },
    mapPlaceholderSubtext: {
        fontSize: 14,
        color: '#8E8E93',
        fontFamily: 'System',
        marginTop: 4,
    },
    viewFullMapButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    viewFullMapText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e36057ff',
        fontFamily: 'System',
        marginRight: 8,
    },
    progressSection: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 15,
        padding: 20,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
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
        width: 36,
        height: 36,
        borderRadius: 18,
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
        backgroundColor: '#e36057ff',
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
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8E8E93',
        fontFamily: 'System',
    },
    stepTitleActive: {
        color: '#1C1C1E',
        fontWeight: '700',
    },
    stepTime: {
        fontSize: 12,
        color: '#8E8E93',
        fontFamily: 'System',
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
    addressSection: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 15,
        padding: 20,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    addressTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 16,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    addressInfo: {
        flex: 1,
        marginLeft: 16,
    },
    addressText: {
        fontSize: 16,
        color: '#1C1C1E',
        fontFamily: 'System',
        lineHeight: 22,
        marginBottom: 8,
    },
    changeAddressButton: {
        alignSelf: 'flex-start',
    },
    changeAddressText: {
        fontSize: 14,
        color: '#e36057ff',
        fontFamily: 'System',
        fontWeight: '600',
    },
    orderDetailsSection: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 10,
        borderRadius: 15,
        padding: 20,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    orderDetailsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 16,
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    orderItemName: {
        fontSize: 14,
        color: '#1C1C1E',
        fontFamily: 'System',
        flex: 1,
    },
    orderItemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 8,
    },
    orderTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    orderTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    orderTotalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#e36057ff',
        fontFamily: 'System',
    },
    bottomSpacer: {
        height: 120,
    },
    bottomActions: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 20,
        paddingBottom: 40,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        gap: 12,
    },
    helpButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF3F0',
        borderRadius: 12,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#e36057ff',
    },
    helpButtonText: {
        color: '#e36057ff',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'System',
        marginLeft: 8,
    },
    cancelButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF0F0',
        borderRadius: 12,
        paddingVertical: 16,
        borderWidth: 1,
        borderColor: '#F44336',
    },
    cancelButtonText: {
        color: '#F44336',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'System',
        marginLeft: 8,
    },
});

export default OrderTrackingScreen;
