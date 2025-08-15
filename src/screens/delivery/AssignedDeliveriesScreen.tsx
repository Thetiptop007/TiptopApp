import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../../types';

const DeliveryAssignedScreen: React.FC = () => {
    // Mock assigned orders
    const [assignedOrders, setAssignedOrders] = useState<Order[]>([
        {
            id: '1234',
            customerId: 'cust1',
            items: [],
            total: 25.99,
            status: 'PREPARING',
            paymentStatus: 'COLLECTED',
            paymentMethod: 'COD',
            customerName: 'Alice Johnson',
            customerAddress: '123 Main St, Apt 4B',
            customerPhone: '+1234567890',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: '1235',
            customerId: 'cust2',
            items: [],
            total: 18.50,
            status: 'OUT_FOR_DELIVERY',
            paymentStatus: 'PAID',
            paymentMethod: 'ONLINE',
            customerName: 'Bob Smith',
            customerAddress: '456 Oak Ave, House 12',
            customerPhone: '+1234567891',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ]);

    const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
        setAssignedOrders(prev => prev.map(order =>
            order.id === orderId ? { ...order, status: newStatus, updatedAt: new Date() } : order
        ));

        Alert.alert('Success', `Order ${orderId} marked as ${newStatus.replace('_', ' ')}`);
    };

    const callCustomer = (phone: string) => {
        Alert.alert('Calling Customer', `Calling ${phone}...`);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PREPARING': return '#FF9800';
            case 'OUT_FOR_DELIVERY': return '#2196F3';
            case 'DELIVERED': return '#4CAF50';
            default: return '#666';
        }
    };

    const renderOrderItem = ({ item }: { item: Order }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status.replace('_', ' ').toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.orderDetails}>
                <View style={styles.detailRow}>
                    <Ionicons name="cash-outline" size={20} color="#666" />
                    <Text style={styles.detailText}>${item.total.toFixed(2)}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={20} color="#666" />
                    <Text style={styles.detailText}>{item.customerAddress}</Text>
                </View>

                <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={20} color="#666" />
                    <Text style={styles.detailText}>
                        {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>

            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                    onPress={() => callCustomer(item.customerPhone)}
                >
                    <Ionicons name="call" size={16} color="#fff" />
                    <Text style={styles.actionButtonText}>Call</Text>
                </TouchableOpacity>

                {item.status === 'PREPARING' && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                        onPress={() => updateOrderStatus(item.id, 'OUT_FOR_DELIVERY')}
                    >
                        <Ionicons name="checkmark" size={16} color="#fff" />
                        <Text style={styles.actionButtonText}>Pick Up</Text>
                    </TouchableOpacity>
                )}

                {item.status === 'OUT_FOR_DELIVERY' && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                        onPress={() => updateOrderStatus(item.id, 'DELIVERED')}
                    >
                        <Ionicons name="checkmark-done" size={16} color="#fff" />
                        <Text style={styles.actionButtonText}>Delivered</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const activeOrders = assignedOrders.filter(order =>
        order.status === 'PREPARING' || order.status === 'OUT_FOR_DELIVERY'
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Assigned Deliveries</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <Text style={styles.statNumber}>{activeOrders.length}</Text>
                        <Text style={styles.statLabel}>Active</Text>
                    </View>
                </View>
            </View>

            {activeOrders.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="bicycle-outline" size={80} color="#ccc" />
                    <Text style={styles.emptyStateText}>No deliveries assigned</Text>
                    <Text style={styles.emptyStateSubtext}>You're all caught up!</Text>
                </View>
            ) : (
                <FlatList
                    data={activeOrders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.ordersList}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    statsContainer: {
        flexDirection: 'row',
    },
    stat: {
        alignItems: 'center',
        marginRight: 30,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF6B35',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 20,
    },
    emptyStateSubtext: {
        fontSize: 16,
        color: '#999',
        marginTop: 10,
    },
    ordersList: {
        padding: 10,
    },
    orderCard: {
        backgroundColor: '#fff',
        marginBottom: 10,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    orderId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    orderDetails: {
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    actionButtonText: {
        color: '#fff',
        marginLeft: 5,
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default DeliveryAssignedScreen;
