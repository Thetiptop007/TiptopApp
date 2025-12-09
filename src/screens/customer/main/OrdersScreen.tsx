import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order, CartItem, MenuItem } from '../../../types';
import { useSwipeNavigation } from '../../../contexts/SwipeNavigationContext';
import { useCart } from '../../../contexts/CartContext';
import { orderAPI } from '../../../api/order.api';
import { useAuth } from '../../../contexts/AuthContext';

interface ExtendedOrder extends Order {
    estimatedTime?: number;
}

const CustomerOrdersScreen: React.FC = () => {
    const { navigateToOrder } = useSwipeNavigation();
    const { cartCount } = useCart();
    const { isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
    const [currentOrders, setCurrentOrders] = useState<ExtendedOrder[]>([]);
    const [pastOrders, setPastOrders] = useState<ExtendedOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch orders from backend
    const fetchOrders = async (isRefreshing = false) => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        try {
            if (!isRefreshing) setLoading(true);
            setError(null);

            // Calculate date 7 days ago
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const startDate = sevenDaysAgo.toISOString();

            // Fetch orders from last 7 days
            const currentResponse = await orderAPI.getMyOrders({
                'createdAt[gte]': startDate,
                limit: 50,
                sort: '-createdAt',
            });

            console.log('\n========== ORDERS FETCHED FROM BACKEND ==========');
            console.log('Total Orders Retrieved:', currentResponse.data.orders.length);
            
            // Separate current and history orders
            const current = currentResponse.data.orders.filter(
                (order: any) => !['DELIVERED', 'CANCELLED', 'COMPLETED'].includes(order.status)
            );
            const history = currentResponse.data.orders.filter(
                (order: any) => ['DELIVERED', 'COMPLETED'].includes(order.status)
            );

            console.log('\nCurrent Orders:', current.length);
            console.log('History Orders:', history.length);
            
            // Log detailed info for each order
            console.log('\n--- CURRENT ORDERS DETAILS ---');
            current.forEach((order: any, idx: number) => {
                console.log(`\nOrder ${idx + 1}:`);
                console.log('  Order Number:', order.orderNumber);
                console.log('  Status:', order.status);
                console.log('  Created:', order.createdAt);
                console.log('  Items:', order.items?.map((item: any) => `${item.quantity}x ${item.name} @ ₹${item.price} = ₹${item.subtotal}`));
                console.log('  Pricing:', {
                    itemsTotal: order.pricing?.itemsTotal,
                    deliveryFee: order.pricing?.deliveryFee,
                    gst: order.pricing?.gst,
                    discount: order.pricing?.discount,
                    finalAmount: order.pricing?.finalAmount
                });
            });
            
            if (history.length > 0) {
                console.log('\n--- HISTORY ORDERS DETAILS ---');
                history.forEach((order: any, idx: number) => {
                    console.log(`Order ${idx + 1}: ${order.orderNumber} - ₹${order.pricing?.finalAmount}`);
                });
            }
            console.log('\n===============================================\n');

            setCurrentOrders(current);
            setPastOrders(history);
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            setError(err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
            if (isRefreshing) setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [isAuthenticated]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders(true);
    };

    const handleCancelOrder = (orderId: string, orderNumber: string) => {
        Alert.alert(
            'Cancel Order',
            `Are you sure you want to cancel order #${orderNumber}?`,
            [
                {
                    text: 'No',
                    style: 'cancel',
                },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await orderAPI.cancelOrder(orderId);
                            Alert.alert('Success', 'Order cancelled successfully');
                            // Refresh orders
                            fetchOrders();
                        } catch (error: any) {
                            Alert.alert(
                                'Error',
                                error.response?.data?.message || 'Failed to cancel order'
                            );
                        }
                    },
                },
            ]
        );
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'PENDING':
                return { color: '#2196F3', icon: 'checkmark-circle-outline', text: 'Order Confirmed' };
            case 'READY':
                return { color: '#FF9800', icon: 'checkmark-outline', text: 'Ready for Pickup' };
            case 'OUT_FOR_DELIVERY':
                return { color: '#9C27B0', icon: 'car-outline', text: 'On the Way' };
            case 'DELIVERED':
                return { color: '#4CAF50', icon: 'checkmark-done-outline', text: 'Delivered' };
            case 'CANCELLED':
                return { color: '#F44336', icon: 'close-circle-outline', text: 'Cancelled' };
            default:
                return { color: '#8E8E93', icon: 'help-outline', text: status || 'Unknown' };
        }
    };

    const formatDate = (dateInput: Date | string) => {
        // Convert to Date object if it's a string
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        
        // Check if date is valid
        if (!date || isNaN(date.getTime())) {
            return 'Invalid date';
        }

        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffInHours < 48) {
            return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return `${date.toLocaleDateString()}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
    };

    const renderOrderItem = ({ item }: { item: any }) => {
        const statusInfo = getStatusInfo(item.status);
        const isActive = !['DELIVERED', 'CANCELLED'].includes(item.status);
        const orderItems = item.items || [];
        
        // Extract pricing details from backend Order model structure
        const pricing = item.pricing || {};
        const itemsTotal = pricing.itemsTotal || 0;
        const deliveryFee = pricing.deliveryFee || 0;
        const platformFee = pricing.platformFee || 0;
        const packagingFee = pricing.packagingFee || 0;
        const gst = pricing.gst || 0;
        const discount = pricing.discount || 0;
        const finalAmount = pricing.finalAmount || 0;

        console.log('\n========== RENDERING ORDER CARD ==========');
        console.log('Order Number:', item.orderNumber);
        console.log('Status:', item.status);
        console.log('\nItems:', orderItems.map((oi: any) => ({
            name: oi.name,
            quantity: oi.quantity,
            price: oi.price,
            subtotal: oi.subtotal,
            calculatedSubtotal: oi.price * oi.quantity
        })));
        console.log('\nPricing Breakdown:');
        console.log('  Items Total:', itemsTotal);
        console.log('  Delivery Fee:', deliveryFee);
        console.log('  Platform Fee:', platformFee);
        console.log('  Packaging Fee:', packagingFee);
        console.log('  GST:', gst);
        console.log('  Discount:', discount);
        console.log('  FINAL AMOUNT:', finalAmount);
        console.log('========================================\n');

        // Check if there are any extra charges
        const hasExtraCharges = deliveryFee > 0 || platformFee > 0 || packagingFee > 0 || gst > 0 || discount > 0;

        return (
            <TouchableOpacity style={styles.orderCard} activeOpacity={0.7}>
                <View style={styles.orderHeader}>
                    <View style={styles.orderIdContainer}>
                        <Text style={styles.orderId}>#{item.orderNumber || 'N/A'}</Text>
                        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                        <Ionicons name={statusInfo.icon as any} size={12} color="#FFFFFF" />
                        <Text style={styles.statusText}>{statusInfo.text}</Text>
                    </View>
                </View>

                <View style={styles.orderContent}>
                    {/* Items List */}
                    <View style={styles.itemsContainer}>
                        <Text style={styles.itemsLabel}>Items:</Text>
                        {orderItems.map((orderItem: any, index: number) => (
                            <View key={index} style={styles.itemRow}>
                                <Text style={styles.itemText}>
                                    {orderItem.quantity}x {orderItem.name}
                                </Text>
                                <Text style={styles.itemPrice}>
                                    ₹{orderItem.subtotal?.toFixed(2) || (orderItem.price * orderItem.quantity).toFixed(2)}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Price Breakdown */}
                    <View style={styles.pricingBreakdown}>
                        <View style={styles.pricingRow}>
                            <Text style={styles.pricingLabel}>Items Total</Text>
                            <Text style={styles.pricingValue}>₹{itemsTotal.toFixed(2)}</Text>
                        </View>

                        {hasExtraCharges && (
                            <>
                                {deliveryFee > 0 && (
                                    <View style={styles.pricingRow}>
                                        <Text style={styles.pricingLabel}>Delivery Fee</Text>
                                        <Text style={styles.pricingValue}>₹{deliveryFee.toFixed(2)}</Text>
                                    </View>
                                )}
                                {platformFee > 0 && (
                                    <View style={styles.pricingRow}>
                                        <Text style={styles.pricingLabel}>Platform Fee</Text>
                                        <Text style={styles.pricingValue}>₹{platformFee.toFixed(2)}</Text>
                                    </View>
                                )}
                                {packagingFee > 0 && (
                                    <View style={styles.pricingRow}>
                                        <Text style={styles.pricingLabel}>Packaging Fee</Text>
                                        <Text style={styles.pricingValue}>₹{packagingFee.toFixed(2)}</Text>
                                    </View>
                                )}
                                {gst > 0 && (
                                    <View style={styles.pricingRow}>
                                        <Text style={styles.pricingLabel}>GST</Text>
                                        <Text style={styles.pricingValue}>₹{gst.toFixed(2)}</Text>
                                    </View>
                                )}
                                {discount > 0 && (
                                    <View style={styles.pricingRow}>
                                        <Text style={[styles.pricingLabel, { color: '#4CAF50' }]}>Discount</Text>
                                        <Text style={[styles.pricingValue, { color: '#4CAF50' }]}>-₹{discount.toFixed(2)}</Text>
                                    </View>
                                )}
                            </>
                        )}

                        <View style={styles.divider} />
                        
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalAmount}>₹{finalAmount.toFixed(2)}</Text>
                        </View>
                    </View>

                    {isActive && item.estimatedDeliveryTime && (
                        <View style={styles.estimatedTimeContainer}>
                            <Ionicons name="time-outline" size={14} color="#e36057ff" />
                            <Text style={styles.estimatedTime}>
                                Est. {new Date(item.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Payment & Delivery Info */}
                <View style={styles.orderFooter}>
                    <View style={styles.paymentInfo}>
                        <Ionicons 
                            name={item.paymentMethod === 'COD' ? 'cash-outline' : 'card-outline'} 
                            size={14} 
                            color="#8E8E93" 
                        />
                        <Text style={styles.paymentText}>
                            {item.paymentMethod} {item.paymentStatus === 'PAID' ? '(Paid)' : ''}
                        </Text>
                    </View>
                    
                    {item.deliveryAddress && (
                        <Text style={styles.addressText} numberOfLines={1}>
                            📍 {item.deliveryAddress.street}, {item.deliveryAddress.city}
                        </Text>
                    )}
                    
                    {/* Cancel Button - Only for PENDING status */}
                    {item.status === 'PENDING' && (
                        <TouchableOpacity 
                            style={styles.cancelButton}
                            onPress={() => handleCancelOrder(item._id, item.orderNumber)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="close-circle-outline" size={16} color="#F44336" />
                            <Text style={styles.cancelButtonText}>Cancel Order</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyState = (type: 'current' | 'history') => (
        <View style={styles.emptyContainer}>
            <Ionicons
                name={type === 'current' ? 'basket-outline' : 'receipt-outline'}
                size={64}
                color="#8E8E93"
            />
            <Text style={styles.emptyTitle}>
                {type === 'current' ? 'No Active Orders' : 'No Order History'}
            </Text>
            <Text style={styles.emptySubtitle}>
                {type === 'current'
                    ? 'Start exploring our delicious menu to place your first order!'
                    : 'Your completed and cancelled orders will appear here.'
                }
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header - Match MenuScreen style */}
            <View style={styles.titleContainer}>
                <Text style={styles.title}>My Orders</Text>

                {/* Cart Icon */}
                <TouchableOpacity 
                    style={styles.cartButton} 
                    activeOpacity={0.7}
                    onPress={() => navigateToOrder('Cart')}
                >
                    <Ionicons name="bag-outline" size={24} color="#1C1C1E" />
                    {cartCount > 0 && (
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>
                                {cartCount > 99 ? '99+' : cartCount}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'current' && styles.activeTab]}
                    onPress={() => setActiveTab('current')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>
                        Current Orders ({currentOrders.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                    onPress={() => setActiveTab('history')}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                        Order History ({pastOrders.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Orders List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#e36057ff" />
                    <Text style={styles.loadingText}>Loading orders...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => fetchOrders()}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : !isAuthenticated ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="person-outline" size={64} color="#8E8E93" />
                    <Text style={styles.emptyTitle}>Login Required</Text>
                    <Text style={styles.emptySubtitle}>Please login to view your orders</Text>
                </View>
            ) : (
                <FlatList
                    data={activeTab === 'current' ? currentOrders : pastOrders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => `${activeTab}-${item.id}`}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.ordersList}
                    ListEmptyComponent={() => renderEmptyState(activeTab)}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#e36057ff"
                        />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        textAlign: 'left',
    },
    cartButton: {
        position: 'relative',
        padding: 8,
    },
    cartBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: '#e36057ff',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    cartBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
        fontFamily: 'System',
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 25,
        padding: 4,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#2a2a2aff',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8E8E93',
        fontFamily: 'System',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    ordersList: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        marginBottom: 15,
        padding: 16,
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
    },
    itemsLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '600',
        fontFamily: 'System',
        marginBottom: 4,
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
    moreItems: {
        fontSize: 12,
        color: '#e36057ff',
        fontFamily: 'System',
        fontWeight: '500',
        fontStyle: 'italic',
    },
    pricingBreakdown: {
        backgroundColor: '#F8F9FA',
        padding: 12,
        borderRadius: 12,
        marginTop: 8,
    },
    pricingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    pricingLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontFamily: 'System',
    },
    pricingValue: {
        fontSize: 12,
        color: '#1C1C1E',
        fontFamily: 'System',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceContainer: {
        alignItems: 'flex-start',
    },
    totalLabel: {
        fontSize: 13,
        color: '#1C1C1E',
        fontFamily: 'System',
        fontWeight: '700',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#e36057ff',
        fontFamily: 'System',
    },
    estimatedTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3F0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    estimatedTime: {
        fontSize: 12,
        color: '#e36057ff',
        fontWeight: '600',
        marginLeft: 4,
        fontFamily: 'System',
    },
    orderActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
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
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#e36057ff',
    },
    secondaryButtonText: {
        color: '#e36057ff',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
        fontFamily: 'System',
    },
    orderFooter: {
        flexDirection: 'column',
        gap: 8,
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
    addressText: {
        fontSize: 12,
        color: '#8E8E93',
        fontFamily: 'System',
    },
    cancelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFEBEE',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    cancelButtonText: {
        fontSize: 12,
        color: '#F44336',
        fontFamily: 'System',
        fontWeight: '600',
        marginLeft: 4,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#8E8E93',
        fontFamily: 'System',
        textAlign: 'center',
        lineHeight: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    loadingText: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 12,
        fontFamily: 'System',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    errorText: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 12,
        marginBottom: 20,
        textAlign: 'center',
        fontFamily: 'System',
    },
    retryButton: {
        backgroundColor: '#e36057ff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'System',
    },
});

export default CustomerOrdersScreen;
