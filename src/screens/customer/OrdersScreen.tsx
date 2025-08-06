import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../../types';

const CustomerOrdersScreen: React.FC = () => {
    // Mock order data
    const [orders] = useState<Order[]>([
        {
            id: '1234',
            customerId: 'cust1',
            items: [],
            total: 25.99,
            status: 'delivered',
            customerAddress: '123 Main St',
            customerPhone: '+1234567890',
            createdAt: new Date('2024-01-15T10:30:00'),
            updatedAt: new Date('2024-01-15T11:30:00'),
        },
        {
            id: '1235',
            customerId: 'cust1',
            items: [],
            total: 18.50,
            status: 'preparing',
            customerAddress: '123 Main St',
            customerPhone: '+1234567890',
            createdAt: new Date('2024-01-16T12:00:00'),
            updatedAt: new Date('2024-01-16T12:15:00'),
        },
        {
            id: '1236',
            customerId: 'cust1',
            items: [],
            total: 32.75,
            status: 'cancelled',
            customerAddress: '123 Main St',
            customerPhone: '+1234567890',
            createdAt: new Date('2024-01-14T09:00:00'),
            updatedAt: new Date('2024-01-14T09:30:00'),
        },
    ]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return '#FF9800';
            case 'confirmed': return '#2196F3';
            case 'preparing': return '#FF6B35';
            case 'ready': return '#4CAF50';
            case 'picked_up': return '#9C27B0';
            case 'delivered': return '#4CAF50';
            case 'cancelled': return '#F44336';
            default: return '#666';
        }
    };

    const renderOrderItem = ({ item }: { item: Order }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>

            <Text style={styles.orderAmount}>${item.total.toFixed(2)}</Text>
            <Text style={styles.orderDate}>
                {item.createdAt.toLocaleDateString()} at {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>

            <View style={styles.orderActions}>
                {item.status === 'delivered' && (
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="refresh" size={16} color="#FF6B35" />
                        <Text style={styles.actionText}>Reorder</Text>
                    </TouchableOpacity>
                )}

                {(item.status === 'pending' || item.status === 'confirmed') && (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#F44336' }]}>
                        <Ionicons name="close" size={16} color="#fff" />
                        <Text style={[styles.actionText, { color: '#fff' }]}>Cancel</Text>
                    </TouchableOpacity>
                )}

                {(item.status === 'preparing' || item.status === 'ready' || item.status === 'picked_up') && (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#2196F3' }]}>
                        <Ionicons name="eye" size={16} color="#fff" />
                        <Text style={[styles.actionText, { color: '#fff' }]}>Track</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const currentOrders = orders.filter(order =>
        order.status !== 'delivered' && order.status !== 'cancelled'
    );

    const pastOrders = orders.filter(order =>
        order.status === 'delivered' || order.status === 'cancelled'
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Orders</Text>

            {currentOrders.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>Current Orders</Text>
                    <FlatList
                        data={currentOrders}
                        renderItem={renderOrderItem}
                        keyExtractor={(item) => `current-${item.id}`}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            )}

            <Text style={styles.sectionTitle}>Order History</Text>
            <FlatList
                data={pastOrders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => `past-${item.id}`}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        padding: 20,
        color: '#333',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 20,
        paddingVertical: 10,
        color: '#333',
    },
    orderCard: {
        backgroundColor: '#fff',
        margin: 10,
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
        marginBottom: 10,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    orderAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B35',
        marginBottom: 5,
    },
    orderDate: {
        fontSize: 12,
        color: '#666',
        marginBottom: 15,
    },
    orderActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#FF6B35',
    },
    actionText: {
        marginLeft: 5,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FF6B35',
    },
});

export default CustomerOrdersScreen;
