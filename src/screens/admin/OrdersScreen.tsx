import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../../types';

const AdminOrdersScreen: React.FC = () => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Mock data
    const orders: Order[] = [
        {
            id: '1234',
            customerId: 'cust1',
            items: [],
            total: 25.99,
            status: 'pending',
            customerAddress: '123 Main St',
            customerPhone: '+1234567890',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: '1235',
            customerId: 'cust2',
            items: [],
            total: 18.50,
            status: 'preparing',
            customerAddress: '456 Oak Ave',
            customerPhone: '+1234567891',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: '1236',
            customerId: 'cust3',
            items: [],
            total: 32.75,
            status: 'ready',
            customerAddress: '789 Pine St',
            customerPhone: '+1234567892',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

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

    const handleOrderPress = (order: Order) => {
        setSelectedOrder(order);
        setModalVisible(true);
    };

    const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
        // In real app, make API call to update order status
        console.log(`Updating order ${orderId} to ${newStatus}`);
        setModalVisible(false);
    };

    const renderOrderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => handleOrderPress(item)}
        >
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>

            <Text style={styles.orderAmount}>${item.total.toFixed(2)}</Text>
            <Text style={styles.orderAddress}>{item.customerAddress}</Text>
            <Text style={styles.orderTime}>
                {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Orders Management</Text>

            <FlatList
                data={orders}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedOrder && (
                            <>
                                <Text style={styles.modalTitle}>Order #{selectedOrder.id}</Text>

                                <View style={styles.orderDetails}>
                                    <Text style={styles.detailText}>Amount: ${selectedOrder.total.toFixed(2)}</Text>
                                    <Text style={styles.detailText}>Address: {selectedOrder.customerAddress}</Text>
                                    <Text style={styles.detailText}>Phone: {selectedOrder.customerPhone}</Text>
                                    <Text style={styles.detailText}>Status: {selectedOrder.status}</Text>
                                </View>

                                <Text style={styles.actionTitle}>Update Status:</Text>
                                <View style={styles.statusActions}>
                                    {['confirmed', 'preparing', 'ready', 'picked_up'].map((status) => (
                                        <TouchableOpacity
                                            key={status}
                                            style={[styles.statusButton, { backgroundColor: getStatusColor(status) }]}
                                            onPress={() => updateOrderStatus(selectedOrder.id, status as Order['status'])}
                                        >
                                            <Text style={styles.statusButtonText}>{status.replace('_', ' ').toUpperCase()}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.closeButtonText}>Close</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
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
    orderAddress: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    orderTime: {
        fontSize: 12,
        color: '#999',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    orderDetails: {
        marginBottom: 20,
    },
    detailText: {
        fontSize: 16,
        marginBottom: 8,
        color: '#333',
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    statusActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    statusButton: {
        padding: 8,
        margin: 5,
        borderRadius: 5,
    },
    statusButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    closeButton: {
        backgroundColor: '#666',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AdminOrdersScreen;
