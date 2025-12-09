import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, Alert, Platform, StatusBar, RefreshControl, Image, Linking, ActivityIndicator, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import deliveryAPI from '../../api/delivery.api';

// Backend order interface
interface OrderItem {
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
    portion?: string;
    subtotal: number;
}

interface DeliveryOrder {
    _id: string;
    orderNumber: string;
    customer: {
        id: string;
        name: string;
        phone: string;
        email: string;
    };
    deliveryAddress: {
        street: string;
        city: string;
        state?: string;
        zipCode?: string;
        coordinates?: {
            latitude: number;
            longitude: number;
        };
    };
    items: OrderItem[];
    pricing: {
        itemsTotal: number;
        deliveryFee: number;
        platformFee: number;
        packagingFee: number;
        gst: number;
        discount: number;
        finalAmount: number;
    };
    status: 'PENDING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
    paymentMethod: 'COD' | 'ONLINE';
    paymentStatus: 'PENDING' | 'PAID' | 'COLLECTED';
    deliveryPartner?: {
        id: string;
        name: string;
        phone: string;
        assignedAt: Date;
    };
    cashCollection?: {
        expectedAmount: number;
        collectedAmount?: number;
        changeFund?: number;
        collectedAt?: Date;
    };
    createdAt: string;
    updatedAt: string;
}

const DeliveryAssignedScreen: React.FC = () => {
    const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'READY' | 'OUT_FOR_DELIVERY'>('ALL');
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [assignedOrders, setAssignedOrders] = useState<DeliveryOrder[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<DeliveryOrder | null>(null);
    const [upiId, setUpiId] = useState<string>('thetiptop@paytm'); // Default fallback

    // Fetch assigned orders
    const fetchAssignedOrders = useCallback(async () => {
        try {
            setLoading(true);
            const response = await deliveryAPI.getAssignedOrders();
            
            if (response.status === 'success') {
                setAssignedOrders(response.data.orders || []);
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch UPI ID from settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await deliveryAPI.getSettings();
                if (response.success && response.data?.settings?.upiId) {
                    setUpiId(response.data.settings.upiId);
                }
            } catch (error) {
                // Keep default fallback UPI ID
            }
        };
        fetchSettings();
    }, []);

    // Initial load
    useEffect(() => {
        fetchAssignedOrders();
    }, [fetchAssignedOrders]);

    // Refresh orders
    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await fetchAssignedOrders();
        } catch (error) {
            // Error refreshing
        } finally {
            setRefreshing(false);
        }
    }, [fetchAssignedOrders]);

    // Mark order as picked up (READY -> OUT_FOR_DELIVERY)
    const markOrderPickedUp = async (orderId: string, orderNumber: string) => {
        try {
            const response = await deliveryAPI.markOrderPickedUp(orderId);
            if (response.status === 'success') {
                Alert.alert('Success', `Order ${orderNumber} marked as picked up`);
                await fetchAssignedOrders(); // Refresh list
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to mark order picked up');
        }
    };

    // Show payment modal for COD orders
    const handleCompleteOrder = (order: DeliveryOrder) => {
        if (order.paymentMethod === 'COD') {
            // Show QR code payment modal
            setSelectedOrderForPayment(order);
            setShowPaymentModal(true);
        } else {
            // Online payment already done - just mark as delivered
            markOrderDelivered(order._id, order.orderNumber, false);
        }
    };

    // Mark order as delivered (OUT_FOR_DELIVERY -> DELIVERED)
    const markOrderDelivered = async (orderId: string, orderNumber: string, skipPayment: boolean = false) => {
        try {
            const response = await deliveryAPI.markOrderDelivered(orderId);
            if (response.status === 'success') {
                Alert.alert('Success', `Order ${orderNumber} delivered successfully`);
                setShowPaymentModal(false);
                setSelectedOrderForPayment(null);
                await fetchAssignedOrders();
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to mark order delivered');
        }
    };

    // Generate UPI payment link
    const generateUPILink = (amount: number, orderNumber: string) => {
        const name = 'The Tip Top Restaurant';
        const note = `Payment for Order ${orderNumber}`;
        
        return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    };

    const callCustomer = (phone: string) => {
        Linking.openURL(`tel:${phone}`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'READY': return '#FF9500';
            case 'OUT_FOR_DELIVERY': return '#007AFF';
            case 'DELIVERED': return '#34C759';
            default: return '#8E8E93';
        }
    };

    const formatAddress = (address: DeliveryOrder['deliveryAddress']) => {
        const parts = [address.street, address.city, address.state].filter(Boolean);
        return parts.join(', ');
    };

    const renderOrderItem = ({ item }: { item: DeliveryOrder }) => (
        <TouchableOpacity style={styles.orderCard} activeOpacity={0.7}>
            {/* Card Header */}
            <View style={styles.orderHeader}>
                <View style={styles.orderIdContainer}>
                    <Text style={styles.orderId}>#{item.orderNumber}</Text>
                    <Text style={styles.orderDate}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Ionicons name="ellipse" size={8} color="#FFFFFF" />
                    <Text style={styles.statusText}>{item.status.replace('_', ' ')}</Text>
                </View>
            </View>

            <View style={styles.orderContent}>
                {/* Items List */}
                <View style={styles.itemsContainer}>
                    <Text style={styles.itemsLabel}>Items:</Text>
                    {item.items.map((orderItem, index) => (
                        <View key={index} style={styles.itemRow}>
                            <Text style={styles.itemText}>
                                {orderItem.quantity}x {orderItem.name}
                                {orderItem.portion ? ` (${orderItem.portion})` : ''}
                            </Text>
                            <Text style={styles.itemPrice}>
                                ₹{orderItem.subtotal.toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Customer Info */}
                <View style={styles.customerSection}>
                    <View style={styles.customerIconContainer}>
                        <Ionicons name="person" size={20} color="#e36057ff" />
                    </View>
                    <View style={styles.customerInfo}>
                        <Text style={styles.customerName}>{item.customer.name}</Text>
                        <Text style={styles.customerPhone}>{item.customer.phone}</Text>
                    </View>
                </View>

                {/* Address */}
                <View style={styles.addressSection}>
                    <Ionicons name="location" size={16} color="#8E8E93" />
                    <Text style={styles.addressText}>{formatAddress(item.deliveryAddress)}</Text>
                </View>

                {/* Payment Info */}
                <View style={styles.paymentSection}>
                    <View style={styles.paymentInfo}>
                        <Ionicons 
                            name={item.paymentMethod === 'COD' ? 'cash-outline' : 'card-outline'} 
                            size={14} 
                            color="#8E8E93" 
                        />
                        <Text style={styles.paymentText}>
                            {item.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}
                        </Text>
                    </View>
                    <Text style={styles.amountText}>₹{item.pricing.finalAmount.toFixed(2)}</Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.orderFooter}>
                <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                        style={styles.callButton}
                        onPress={() => callCustomer(item.customer.phone)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="call" size={16} color="#007AFF" />
                        <Text style={styles.callButtonText}>Call</Text>
                    </TouchableOpacity>

                    {item.status === 'READY' && (
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => markOrderPickedUp(item._id, item.orderNumber)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="bag-check" size={16} color="#fff" />
                            <Text style={styles.primaryButtonText}>Mark Pickup</Text>
                        </TouchableOpacity>
                    )}

                    {item.status === 'OUT_FOR_DELIVERY' && (
                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: '#34C759' }]}
                            onPress={() => handleCompleteOrder(item)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
                            <Text style={styles.primaryButtonText}>Complete</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.collectPaymentButton}
                    onPress={() => {
                        setSelectedOrderForPayment(item);
                        setShowPaymentModal(true);
                    }}
                    activeOpacity={0.7}
                >
                    <Ionicons name="qr-code-outline" size={18} color="#fff" />
                    <Text style={styles.collectPaymentButtonText}>Collect Payment</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    const activeOrders = assignedOrders.filter(order => {
        // Show READY and OUT_FOR_DELIVERY orders
        const isActive = order.status === 'READY' || order.status === 'OUT_FOR_DELIVERY';
        if (selectedFilter === 'ALL') return isActive;
        return isActive && order.status === selectedFilter;
    });

    const readyCount = assignedOrders.filter(o => o.status === 'READY').length;
    const deliveringCount = assignedOrders.filter(o => o.status === 'OUT_FOR_DELIVERY').length;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Modern Header with Background Image */}
            <View style={styles.headerContainer}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80' }}
                    style={styles.headerBackgroundImage}
                    resizeMode="cover"
                />
                <View style={styles.headerOverlay}>
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <View>
                                <Text style={styles.greeting}>Hello Rider! 👋</Text>
                                <Text style={styles.title}>Active Deliveries</Text>
                            </View>
                        </View>

                        {/* Filter Tabs */}
                        <View style={styles.filterContainer}>
                            <TouchableOpacity
                                style={[styles.filterTab, selectedFilter === 'ALL' && styles.filterTabActive]}
                                onPress={() => setSelectedFilter('ALL')}
                            >
                                <Text style={[styles.filterText, selectedFilter === 'ALL' && styles.filterTextActive]}>
                                    All ({activeOrders.length})
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterTab, selectedFilter === 'READY' && styles.filterTabActive]}
                                onPress={() => setSelectedFilter('READY')}
                            >
                                <Text style={[styles.filterText, selectedFilter === 'READY' && styles.filterTextActive]}>
                                    Ready ({readyCount})
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.filterTab, selectedFilter === 'OUT_FOR_DELIVERY' && styles.filterTabActive]}
                                onPress={() => setSelectedFilter('OUT_FOR_DELIVERY')}
                            >
                                <Text style={[styles.filterText, selectedFilter === 'OUT_FOR_DELIVERY' && styles.filterTextActive]}>
                                    Delivering ({deliveringCount})
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            {/* Orders List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#e36057ff" />
                    <Text style={styles.loadingText}>Loading orders...</Text>
                </View>
            ) : activeOrders.length === 0 ? (
                <ScrollView
                    contentContainerStyle={styles.emptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#e36057ff"
                            colors={['#e36057ff']}
                        />
                    }
                >
                    <View style={styles.emptyIconContainer}>
                        <Ionicons name="bicycle-outline" size={64} color="#8E8E93" />
                    </View>
                    <Text style={styles.emptyStateText}>No Active Deliveries</Text>
                    <Text style={styles.emptyStateSubtext}>
                        {selectedFilter === 'ALL' ? 'All caught up! Check back soon for new orders' : 'No orders in this category'}
                    </Text>
                </ScrollView>
            ) : (
                <FlatList
                    data={activeOrders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.ordersList}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#e36057ff"
                            colors={['#e36057ff']}
                        />
                    }
                />
            )}

            {/* Payment QR Code Modal */}
            <Modal
                visible={showPaymentModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowPaymentModal(false)}
            >
                <Pressable 
                    style={styles.modalOverlay}
                    onPress={() => setShowPaymentModal(false)}
                >
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Collect Payment</Text>
                            <TouchableOpacity
                                onPress={() => setShowPaymentModal(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color="#1C1C1E" />
                            </TouchableOpacity>
                        </View>

                        {selectedOrderForPayment && (
                            <>
                                <View style={styles.paymentDetails}>
                                    <Text style={styles.paymentOrderNumber}>
                                        Order #{selectedOrderForPayment.orderNumber}
                                    </Text>
                                    <Text style={styles.paymentAmount}>
                                        ₹{selectedOrderForPayment.pricing.finalAmount.toFixed(2)}
                                    </Text>
                                </View>

                                {/* Payment Method Badge */}
                                <View style={styles.paymentMethodBadge}>
                                    <Ionicons 
                                        name={selectedOrderForPayment.paymentMethod === 'COD' ? 'cash-outline' : 'card-outline'} 
                                        size={16} 
                                        color={selectedOrderForPayment.paymentMethod === 'COD' ? '#FF9500' : '#007AFF'} 
                                    />
                                    <Text style={styles.paymentMethodText}>
                                        {selectedOrderForPayment.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}
                                    </Text>
                                </View>

                                <View style={styles.qrCodeContainer}>
                                    <View style={styles.qrCodeWrapper}>
                                        <QRCode
                                            value={generateUPILink(
                                                selectedOrderForPayment.pricing.finalAmount,
                                                selectedOrderForPayment.orderNumber
                                            )}
                                            size={160}
                                            backgroundColor="white"
                                            color="#1C1C1E"
                                        />
                                    </View>
                                    <Text style={styles.qrCodeHintText}>
                                        {selectedOrderForPayment.paymentMethod === 'COD' 
                                            ? 'Scan to collect payment' 
                                            : 'For verification or re-payment if needed'}
                                    </Text>
                                </View>

                                <View style={styles.modalActions}>
                                    {selectedOrderForPayment.paymentMethod === 'ONLINE' ? (
                                        <TouchableOpacity
                                            style={[styles.confirmPaymentButton, { backgroundColor: '#007AFF' }]}
                                            onPress={() => {
                                                setShowPaymentModal(false);
                                                setSelectedOrderForPayment(null);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
                                            <Text style={styles.confirmPaymentText}>Already Paid Online</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity
                                            style={styles.confirmPaymentButton}
                                            onPress={() => markOrderDelivered(
                                                selectedOrderForPayment._id,
                                                selectedOrderForPayment.orderNumber
                                            )}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                            <Text style={styles.confirmPaymentText}>Payment Received</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {selectedOrderForPayment.paymentMethod === 'COD' && (
                                    <TouchableOpacity
                                        style={styles.skipPaymentButton}
                                        onPress={() => {
                                            Alert.alert(
                                                'Skip Payment?',
                                                'Mark order as delivered without payment confirmation?',
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    {
                                                        text: 'Confirm',
                                                        onPress: () => markOrderDelivered(
                                                            selectedOrderForPayment._id,
                                                            selectedOrderForPayment.orderNumber,
                                                            true
                                                        ),
                                                    },
                                                ]
                                            );
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.skipPaymentText}>Skip & Mark Delivered</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    headerContainer: {
        height: 240,
        overflow: 'hidden',
        position: 'relative',
    },
    headerBackgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
    },
    headerOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.61)',
        justifyContent: 'flex-end',
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerContent: {
        marginBottom: 20,
    },
    greeting: {
        fontSize: 15,
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: 4,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    filterContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 12,
        padding: 4,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderRadius: 10,
        alignItems: 'center',
    },
    filterTabActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    filterText: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '600',
        opacity: 0.8,
    },
    filterTextActive: {
        color: '#e36057ff',
        opacity: 1,
        fontWeight: '700',
    },
    emptyState: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyStateText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1C1C1E',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 0.3,
    },
    emptyStateSubtext: {
        fontSize: 15,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
        fontWeight: '500',
    },
    ordersList: {
        padding: 16,
        paddingBottom: 100,
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 16,
        marginBottom: 15,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderIdContainer: {
        flex: 1,
    },
    orderId: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 2,
    },
    orderDate: {
        fontSize: 12,
        color: '#8E8E93',
        fontFamily: 'System',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 15,
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 4,
        fontFamily: 'System',
        textTransform: 'uppercase',
    },
    orderContent: {
        marginBottom: 16,
    },
    itemsContainer: {
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    itemsLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '600',
        fontFamily: 'System',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemText: {
        fontSize: 13,
        color: '#1C1C1E',
        fontFamily: 'System',
        flex: 1,
    },
    itemPrice: {
        fontSize: 13,
        color: '#1C1C1E',
        fontFamily: 'System',
        fontWeight: '600',
    },
    customerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    customerIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF5F3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 4,
    },
    customerPhone: {
        fontSize: 13,
        color: '#8E8E93',
        fontFamily: 'System',
    },
    addressSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 12,
    },
    addressText: {
        flex: 1,
        fontSize: 12,
        color: '#8E8E93',
        fontFamily: 'System',
        lineHeight: 18,
    },
    paymentSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    paymentText: {
        fontSize: 12,
        color: '#8E8E93',
        fontFamily: 'System',
    },
    amountText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#e36057ff',
        fontFamily: 'System',
    },
    orderFooter: {
        flexDirection: 'column',
        gap: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    callButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#007AFF',
    },
    callButtonText: {
        color: '#007AFF',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
        fontFamily: 'System',
    },
    primaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1C1C1E',
        paddingVertical: 12,
        borderRadius: 25,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
        fontFamily: 'System',
    },
    collectPaymentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF9500',
        paddingVertical: 14,
        borderRadius: 25,
        width: '100%',
    },
    collectPaymentButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        marginLeft: 8,
        fontFamily: 'System',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 15,
        color: '#8E8E93',
        fontFamily: 'System',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    closeButton: {
        padding: 4,
    },
    paymentMethodBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginBottom: 12,
        gap: 6,
        alignSelf: 'center',
    },
    paymentMethodText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    paymentDetails: {
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
    },
    paymentOrderNumber: {
        fontSize: 13,
        color: '#8E8E93',
        fontFamily: 'System',
        marginBottom: 6,
    },
    paymentAmount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#e36057ff',
        fontFamily: 'System',
    },
    qrCodeContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    qrCodeWrapper: {
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    qrCodeHintText: {
        fontSize: 12,
        color: '#8E8E93',
        textAlign: 'center',
        fontFamily: 'System',
        marginTop: 8,
        paddingHorizontal: 20,
    },
    qrCodeInstructions: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        fontFamily: 'System',
        paddingHorizontal: 20,
    },
    upiAppsContainer: {
        marginBottom: 24,
        backgroundColor: '#F8F9FA',
        padding: 16,
        borderRadius: 12,
    },
    upiAppsLabel: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '600',
        fontFamily: 'System',
        marginBottom: 12,
    },
    upiAppsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    upiApp: {
        fontSize: 13,
        color: '#1C1C1E',
        fontFamily: 'System',
        fontWeight: '500',
    },
    modalActions: {
        gap: 12,
        marginBottom: 12,
    },
    openUPIButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    openUPIButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'System',
        marginLeft: 8,
    },
    confirmPaymentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#34C759',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    confirmPaymentText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'System',
    },
    skipPaymentButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    skipPaymentText: {
        color: '#8E8E93',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'System',
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
});

export default DeliveryAssignedScreen;
