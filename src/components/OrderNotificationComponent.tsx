import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Vibration,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../types';

interface OrderNotificationProps {
    order: Order;
    visible: boolean;
    onAccept: (orderId: string) => void;
    onReject: (orderId: string) => void;
    onView: (orderId: string) => void;
}

const OrderNotificationComponent: React.FC<OrderNotificationProps> = ({
    order,
    visible,
    onAccept,
    onReject,
    onView,
}) => {
    const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        if (visible && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    const newTime = prev - 1;

                    // Mark as urgent when less than 5 minutes left
                    if (newTime <= 300 && !isUrgent) {
                        setIsUrgent(true);
                        // Vibrate to alert urgency
                        Vibration.vibrate([500, 250, 500]);
                    }

                    // Auto-reject if time runs out
                    if (newTime <= 0) {
                        onReject(order.id);
                        return 0;
                    }

                    return newTime;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [visible, timeLeft, isUrgent, order.id, onReject]);

    // Play notification sound and vibrate when new order arrives
    useEffect(() => {
        if (visible) {
            // Strong vibration pattern for new order
            Vibration.vibrate([1000, 500, 1000, 500, 1000]);
        }
    }, [visible]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getNotificationStyle = () => {
        if (order.paymentMethod === 'COD') {
            return isUrgent ? styles.urgentCODNotification : styles.codNotification;
        }
        return isUrgent ? styles.urgentNotification : styles.normalNotification;
    };

    const getNotificationTitle = () => {
        if (order.paymentMethod === 'COD') {
            return isUrgent ? '🚨 URGENT COD ORDER!' : '💰 New COD Order!';
        }
        return isUrgent ? '🚨 URGENT ORDER!' : '🔔 New Order!';
    };

    if (!visible) return null;

    return (
        <View style={[styles.notificationOverlay, getNotificationStyle()]}>
            <View style={styles.notificationContainer}>
                {/* Header */}
                <View style={styles.notificationHeader}>
                    <Text style={styles.notificationTitle}>{getNotificationTitle()}</Text>
                    <View style={styles.timerContainer}>
                        <Ionicons
                            name="timer"
                            size={16}
                            color={isUrgent ? '#F44336' : '#FF9800'}
                        />
                        <Text style={[styles.timerText, isUrgent && styles.urgentTimerText]}>
                            {formatTime(timeLeft)}
                        </Text>
                    </View>
                </View>

                {/* Order Details */}
                <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>#{order.id}</Text>
                    <Text style={styles.customerName}>{order.customerName}</Text>
                    <Text style={styles.customerPhone}>{order.customerPhone}</Text>
                </View>

                {/* Payment Method */}
                <View style={styles.paymentInfo}>
                    <View style={[
                        styles.paymentBadge,
                        { backgroundColor: order.paymentMethod === 'COD' ? '#FF9800' : '#4CAF50' }
                    ]}>
                        <Ionicons
                            name={order.paymentMethod === 'COD' ? 'cash-outline' : 'card-outline'}
                            size={16}
                            color="#FFFFFF"
                        />
                        <Text style={styles.paymentText}>
                            {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}
                        </Text>
                    </View>
                    <Text style={styles.totalAmount}>₹{order.total.toFixed(0)}</Text>
                </View>

                {/* COD Special Alert */}
                {order.paymentMethod === 'COD' && (
                    <View style={styles.codAlert}>
                        <Ionicons name="warning" size={20} color="#FF9800" />
                        <Text style={styles.codAlertText}>
                            Cash Collection Required: ₹{order.cashToCollect}
                        </Text>
                    </View>
                )}

                {/* Order Items Preview */}
                <View style={styles.itemsPreview}>
                    <Text style={styles.itemsTitle}>Items ({order.items.length}):</Text>
                    {order.items.slice(0, 3).map((item: any, index: number) => (
                        <Text key={index} style={styles.itemText}>
                            {item.quantity}x {item.menuItem.name}
                        </Text>
                    ))}
                    {order.items.length > 3 && (
                        <Text style={styles.moreItemsText}>+{order.items.length - 3} more items</Text>
                    )}
                </View>

                {/* Customer Address */}
                <View style={styles.addressInfo}>
                    <Ionicons name="location" size={16} color="#8E8E93" />
                    <Text style={styles.addressText} numberOfLines={2}>
                        {order.customerAddress}
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.viewButton]}
                        onPress={() => onView(order.id)}
                    >
                        <Ionicons name="eye" size={18} color="#2196F3" />
                        <Text style={styles.viewButtonText}>View Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => {
                            Alert.alert(
                                'Reject Order',
                                'Are you sure you want to reject this order? Customer will be notified.',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Reject',
                                        style: 'destructive',
                                        onPress: () => onReject(order.id)
                                    }
                                ]
                            );
                        }}
                    >
                        <Ionicons name="close" size={18} color="#F44336" />
                        <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => onAccept(order.id)}
                    >
                        <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                        <Text style={styles.acceptButtonText}>Accept & Prepare</Text>
                    </TouchableOpacity>
                </View>

                {/* Auto-reject warning */}
                {isUrgent && (
                    <View style={styles.warningBanner}>
                        <Ionicons name="warning" size={16} color="#F44336" />
                        <Text style={styles.warningText}>
                            Order will be auto-rejected in {formatTime(timeLeft)}!
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    notificationOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    normalNotification: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    codNotification: {
        backgroundColor: 'rgba(255, 152, 0, 0.9)',
    },
    urgentNotification: {
        backgroundColor: 'rgba(244, 67, 54, 0.9)',
    },
    urgentCODNotification: {
        backgroundColor: 'rgba(244, 67, 54, 0.95)',
    },
    notificationContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        marginHorizontal: 20,
        maxWidth: 360,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    notificationTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2C2C2E',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8F0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    timerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF9800',
        marginLeft: 4,
    },
    urgentTimerText: {
        color: '#F44336',
    },
    orderInfo: {
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    orderId: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2C2C2E',
        marginBottom: 6,
    },
    customerName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C2C2E',
        marginBottom: 4,
    },
    customerPhone: {
        fontSize: 14,
        color: '#8E8E93',
    },
    paymentInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    paymentBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    paymentText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 6,
    },
    totalAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2C2C2E',
    },
    codAlert: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8F0',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    codAlertText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF9800',
        marginLeft: 8,
        flex: 1,
    },
    itemsPreview: {
        marginBottom: 16,
    },
    itemsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C2C2E',
        marginBottom: 8,
    },
    itemText: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 2,
    },
    moreItemsText: {
        fontSize: 12,
        color: '#8E8E93',
        fontStyle: 'italic',
    },
    addressInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
    },
    addressText: {
        fontSize: 12,
        color: '#666666',
        marginLeft: 8,
        flex: 1,
        lineHeight: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
    },
    viewButton: {
        backgroundColor: '#E3F2FD',
        borderWidth: 1,
        borderColor: '#BBDEFB',
    },
    viewButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2196F3',
        marginLeft: 4,
    },
    rejectButton: {
        backgroundColor: '#FFEBEE',
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    rejectButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#F44336',
        marginLeft: 4,
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
        flex: 1.5, // Make accept button larger
    },
    acceptButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: 4,
    },
    warningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFEBEE',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    warningText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#F44336',
        marginLeft: 6,
        flex: 1,
    },
});

export default OrderNotificationComponent;
