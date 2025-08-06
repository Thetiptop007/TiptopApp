import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AdminDashboardScreen: React.FC = () => {
    const stats = [
        { title: 'Total Orders', value: '127', icon: 'receipt-outline', color: '#FF6B35' },
        { title: 'Total Revenue', value: '$4,250', icon: 'cash-outline', color: '#4CAF50' },
        { title: 'Active Deliveries', value: '8', icon: 'bicycle-outline', color: '#2196F3' },
        { title: 'Menu Items', value: '42', icon: 'restaurant-outline', color: '#FF9800' },
    ];

    const recentActivities = [
        { id: 1, message: 'New order #1234 received', time: '2 min ago' },
        { id: 2, message: 'Order #1233 delivered', time: '5 min ago' },
        { id: 3, message: 'New delivery person registered', time: '10 min ago' },
        { id: 4, message: 'Menu item updated: Chicken Biryani', time: '15 min ago' },
    ];

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Admin Dashboard</Text>

            <View style={styles.statsContainer}>
                {stats.map((stat, index) => (
                    <View key={index} style={styles.statCard}>
                        <Ionicons name={stat.icon as any} size={32} color={stat.color} />
                        <Text style={styles.statValue}>{stat.value}</Text>
                        <Text style={styles.statTitle}>{stat.title}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                {recentActivities.map((activity) => (
                    <View key={activity.id} style={styles.activityItem}>
                        <Text style={styles.activityMessage}>{activity.message}</Text>
                        <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionsContainer}>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="add-circle-outline" size={24} color="#FF6B35" />
                        <Text style={styles.actionText}>Add Menu Item</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="people-outline" size={24} color="#FF6B35" />
                        <Text style={styles.actionText}>Manage Staff</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
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
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 10,
    },
    statCard: {
        backgroundColor: '#fff',
        width: '48%',
        padding: 20,
        margin: '1%',
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 10,
    },
    statTitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
    section: {
        backgroundColor: '#fff',
        margin: 10,
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    activityItem: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    activityMessage: {
        fontSize: 14,
        color: '#333',
    },
    activityTime: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    actionButton: {
        alignItems: 'center',
        padding: 15,
    },
    actionText: {
        marginTop: 5,
        fontSize: 12,
        color: '#FF6B35',
    },
});

export default AdminDashboardScreen;
