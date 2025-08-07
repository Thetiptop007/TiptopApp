import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order, CartItem, MenuItem } from '../../types';

interface ExtendedOrder extends Order {
    estimatedTime?: number;
}

const CustomerOrdersScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

    // Mock menu items for order data
    const mockMenuItems: MenuItem[] = [
        { id: 'item1', name: 'Butter Chicken', description: 'Creamy tomato curry', price: 12.99, category: 'Non-Veg', available: true, rating: 4.5, reviews: 120 },
        { id: 'item2', name: 'Garlic Naan', description: 'Freshly baked bread', price: 3.99, category: 'Bread', available: true, rating: 4.3, reviews: 85 },
        { id: 'item3', name: 'Chicken Biryani', description: 'Aromatic rice dish', price: 15.99, category: 'Biryani', available: true, rating: 4.7, reviews: 200 },
        { id: 'item4', name: 'Raita', description: 'Yogurt side dish', price: 2.99, category: 'Sides', available: true, rating: 4.2, reviews: 45 },
        { id: 'item5', name: 'Paneer Tikka', description: 'Grilled cottage cheese', price: 14.99, category: 'Veg', available: true, rating: 4.4, reviews: 95 },
        { id: 'item6', name: 'Dal Makhani', description: 'Creamy lentil curry', price: 9.99, category: 'Veg', available: true, rating: 4.6, reviews: 110 },
        { id: 'item7', name: 'Basmati Rice', description: 'Fragrant long grain rice', price: 3.99, category: 'Rice', available: true, rating: 4.1, reviews: 30 },
        { id: 'item8', name: 'Masala Dosa', description: 'South Indian crepe', price: 8.99, category: 'South Indian', available: true, rating: 4.5, reviews: 75 },
        { id: 'item9', name: 'Filter Coffee', description: 'Traditional South Indian coffee', price: 2.99, category: 'Beverages', available: true, rating: 4.3, reviews: 60 },
    ];

    // Mock order data with proper CartItem structure
    const [orders] = useState<ExtendedOrder[]>([
        {
            id: '1234',
            customerId: 'cust1',
            items: [
                { id: 'cart1', menuItem: mockMenuItems[0], quantity: 2 },
                { id: 'cart2', menuItem: mockMenuItems[1], quantity: 1 }
            ],
            total: 29.97,
            status: 'delivered',
            customerAddress: '123 Main St, Downtown',
            customerPhone: '+1234567890',
            createdAt: new Date('2024-01-15T10:30:00'),
            updatedAt: new Date('2024-01-15T11:30:00'),
            estimatedTime: 25,
        },
        {
            id: '1235',
            customerId: 'cust1',
            items: [
                { id: 'cart3', menuItem: mockMenuItems[2], quantity: 1 },
                { id: 'cart4', menuItem: mockMenuItems[3], quantity: 1 }
            ],
            total: 18.98,
            status: 'preparing',
            customerAddress: '123 Main St, Downtown',
            customerPhone: '+1234567890',
            createdAt: new Date('2024-01-16T12:00:00'),
            updatedAt: new Date('2024-01-16T12:15:00'),
            estimatedTime: 20,
        },
        {
            id: '1236',
            customerId: 'cust1',
            items: [
                { id: 'cart5', menuItem: mockMenuItems[4], quantity: 1 },
                { id: 'cart6', menuItem: mockMenuItems[5], quantity: 1 },
                { id: 'cart7', menuItem: mockMenuItems[6], quantity: 2 }
            ],
            total: 32.96,
            status: 'cancelled',
            customerAddress: '123 Main St, Downtown',
            customerPhone: '+1234567890',
            createdAt: new Date('2024-01-14T09:00:00'),
            updatedAt: new Date('2024-01-14T09:30:00'),
        },
        {
            id: '1237',
            customerId: 'cust1',
            items: [
                { id: 'cart8', menuItem: mockMenuItems[7], quantity: 1 },
                { id: 'cart9', menuItem: mockMenuItems[8], quantity: 2 }
            ],
            total: 14.97,
            status: 'ready',
            customerAddress: '123 Main St, Downtown',
            customerPhone: '+1234567890',
            createdAt: new Date('2024-01-17T14:30:00'),
            updatedAt: new Date('2024-01-17T15:00:00'),
            estimatedTime: 5,
        },
    ]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return { color: '#FF9800', icon: 'time-outline', text: 'Order Placed' };
            case 'confirmed':
                return { color: '#2196F3', icon: 'checkmark-circle-outline', text: 'Confirmed' };
            case 'preparing':
                return { color: '#FF6B35', icon: 'restaurant-outline', text: 'Preparing' };
            case 'ready':
                return { color: '#4CAF50', icon: 'bag-check-outline', text: 'Ready for Pickup' };
            case 'picked_up':
                return { color: '#9C27B0', icon: 'car-outline', text: 'Out for Delivery' };
            case 'delivered':
                return { color: '#4CAF50', icon: 'checkmark-done-outline', text: 'Delivered' };
            case 'cancelled':
                return { color: '#F44336', icon: 'close-circle-outline', text: 'Cancelled' };
            default:
                return { color: '#8E8E93', icon: 'help-outline', text: 'Unknown' };
        }
    };

    const formatDate = (date: Date) => {
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

    const currentOrders = orders.filter(order =>
        order.status !== 'delivered' && order.status !== 'cancelled'
    );

    const pastOrders = orders.filter(order =>
        order.status === 'delivered' || order.status === 'cancelled'
    );

    const renderOrderItem = ({ item }: { item: ExtendedOrder }) => {
        const statusInfo = getStatusInfo(item.status);
        const isActive = item.status !== 'delivered' && item.status !== 'cancelled';

        return (
            <TouchableOpacity style={styles.orderCard} activeOpacity={0.7}>
                <View style={styles.orderHeader}>
                    <View style={styles.orderIdContainer}>
                        <Text style={styles.orderId}>#{item.id}</Text>
                        <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
                        <Ionicons name={statusInfo.icon as any} size={12} color="#FFFFFF" />
                        <Text style={styles.statusText}>{statusInfo.text}</Text>
                    </View>
                </View>

                <View style={styles.orderContent}>
                    <View style={styles.itemsContainer}>
                        <Text style={styles.itemsLabel}>Items:</Text>
                        {item.items.slice(0, 2).map((cartItem, index) => (
                            <Text key={index} style={styles.itemText}>
                                {cartItem.quantity}x {cartItem.menuItem.name}
                            </Text>
                        ))}
                        {item.items.length > 2 && (
                            <Text style={styles.moreItems}>
                                +{item.items.length - 2} more items
                            </Text>
                        )}
                    </View>

                    <View style={styles.orderDetails}>
                        <View style={styles.priceContainer}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalAmount}>₹{item.total.toFixed(2)}</Text>
                        </View>

                        {isActive && item.estimatedTime && (
                            <View style={styles.estimatedTimeContainer}>
                                <Ionicons name="time-outline" size={14} color="#FF6B35" />
                                <Text style={styles.estimatedTime}>
                                    {item.estimatedTime} min remaining
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.orderActions}>
                    {item.status === 'delivered' && (
                        <>
                            <TouchableOpacity style={styles.secondaryButton}>
                                <Ionicons name="refresh-outline" size={16} color="#FF6B35" />
                                <Text style={styles.secondaryButtonText}>Reorder</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.primaryButton}>
                                <Ionicons name="star-outline" size={16} color="#FFFFFF" />
                                <Text style={styles.primaryButtonText}>Rate</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {(item.status === 'pending' || item.status === 'confirmed') && (
                        <>
                            <TouchableOpacity style={styles.secondaryButton}>
                                <Ionicons name="call-outline" size={16} color="#FF6B35" />
                                <Text style={styles.secondaryButtonText}>Call</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: '#F44336' }]}>
                                <Ionicons name="close-outline" size={16} color="#FFFFFF" />
                                <Text style={styles.primaryButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {(item.status === 'preparing' || item.status === 'ready' || item.status === 'picked_up') && (
                        <>
                            <TouchableOpacity style={styles.secondaryButton}>
                                <Ionicons name="call-outline" size={16} color="#FF6B35" />
                                <Text style={styles.secondaryButtonText}>Call</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.primaryButton}>
                                <Ionicons name="location-outline" size={16} color="#FFFFFF" />
                                <Text style={styles.primaryButtonText}>Track</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {item.status === 'cancelled' && (
                        <TouchableOpacity style={styles.primaryButton}>
                            <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
                            <Text style={styles.primaryButtonText}>Order Again</Text>
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
            <FlatList
                data={activeTab === 'current' ? currentOrders : pastOrders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => `${activeTab}-${item.id}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.ordersList}
                ListEmptyComponent={() => renderEmptyState(activeTab)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    titleContainer: {
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
    itemText: {
        fontSize: 13,
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 2,
    },
    moreItems: {
        fontSize: 12,
        color: '#FF6B35',
        fontFamily: 'System',
        fontWeight: '500',
        fontStyle: 'italic',
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
        fontSize: 12,
        color: '#8E8E93',
        fontFamily: 'System',
        fontWeight: '500',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FF6B35',
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
        color: '#FF6B35',
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
        borderColor: '#FF6B35',
    },
    secondaryButtonText: {
        color: '#FF6B35',
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
        fontFamily: 'System',
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
});

export default CustomerOrdersScreen;
