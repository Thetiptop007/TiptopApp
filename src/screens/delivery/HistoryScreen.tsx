import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../../types';

const DeliveryHistoryScreen: React.FC = () => {
    // Mock delivery history data
    const [deliveryHistory] = useState<Order[]>([
        {
            id: '1234',
            customerId: 'cust1',
            items: [],
            total: 25.99,
            status: 'delivered',
            customerAddress: '123 Main St, Apt 4B',
            customerPhone: '+1234567890',
            createdAt: new Date('2024-01-15T10:30:00'),
            updatedAt: new Date('2024-01-15T11:30:00'),
        },
        {
            id: '1235',
            customerId: 'cust2',
            items: [],
            total: 18.50,
            status: 'delivered',
            customerAddress: '456 Oak Ave, House 12',
            customerPhone: '+1234567891',
            createdAt: new Date('2024-01-14T12:00:00'),
            updatedAt: new Date('2024-01-14T12:45:00'),
        },
        {
            id: '1236',
            customerId: 'cust3',
            items: [],
            total: 32.75,
            status: 'delivered',
            customerAddress: '789 Pine St, Unit 5',
            customerPhone: '+1234567892',
            createdAt: new Date('2024-01-13T09:00:00'),
            updatedAt: new Date('2024-01-13T09:40:00'),
        },
    ]);

    const getTotalEarnings = () => {
        return deliveryHistory.reduce((sum, order) => sum + (order.total * 0.1), 0); // Assuming 10% delivery fee
    };

    const renderDeliveryItem = ({ item }: { item: Order }) => {
        const deliveryFee = item.total * 0.1; // 10% delivery fee
        const deliveryTime = Math.floor((item.updatedAt.getTime() - item.createdAt.getTime()) / (1000 * 60)); // minutes

        return (
            <View style={styles.deliveryCard}>
                <View style={styles.deliveryHeader}>
                    <Text style={styles.orderId}>Order #{item.id}</Text>
                    <Text style={styles.earnings}>+${deliveryFee.toFixed(2)}</Text>
                </View>

                <View style={styles.deliveryDetails}>
                    <View style={styles.detailRow}>
                        <Ionicons name="location-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>{item.customerAddress}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="time-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>
                            {item.createdAt.toLocaleDateString()} - {deliveryTime} min delivery
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Ionicons name="cash-outline" size={16} color="#666" />
                        <Text style={styles.detailText}>Order total: ${item.total.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.ratingSection}>
                    <Text style={styles.ratingLabel}>Customer Rating:</Text>
                    <View style={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Ionicons
                                key={star}
                                name="star"
                                size={16}
                                color={star <= 4 ? '#FFD700' : '#ddd'}
                            />
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Delivery History</Text>

                <View style={styles.statsContainer}>
                    <View style={styles.stat}>
                        <Text style={styles.statNumber}>{deliveryHistory.length}</Text>
                        <Text style={styles.statLabel}>Total Deliveries</Text>
                    </View>

                    <View style={styles.stat}>
                        <Text style={styles.statNumber}>${getTotalEarnings().toFixed(2)}</Text>
                        <Text style={styles.statLabel}>Total Earnings</Text>
                    </View>

                    <View style={styles.stat}>
                        <Text style={styles.statNumber}>4.2</Text>
                        <Text style={styles.statLabel}>Avg Rating</Text>
                    </View>
                </View>
            </View>

            <FlatList
                data={deliveryHistory}
                renderItem={renderDeliveryItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.historyList}
            />
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
        marginBottom: 20,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    stat: {
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FF6B35',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    historyList: {
        padding: 10,
    },
    deliveryCard: {
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
    deliveryHeader: {
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
    earnings: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    deliveryDetails: {
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    detailText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    ratingSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    ratingLabel: {
        fontSize: 14,
        color: '#333',
    },
    stars: {
        flexDirection: 'row',
    },
});

export default DeliveryHistoryScreen;
