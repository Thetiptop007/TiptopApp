import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DeliveryMapScreen: React.FC = () => {
    const currentDelivery = {
        orderId: '1235',
        customerAddress: '456 Oak Ave, House 12',
        customerPhone: '+1234567891',
        restaurantAddress: '123 Restaurant St',
    };

    const openMaps = (address: string) => {
        Alert.alert('Navigation', `Opening maps to: ${address}`);
        // In real app, use Linking.openURL with Google Maps or Apple Maps
    };

    const callCustomer = () => {
        Alert.alert('Calling Customer', `Calling ${currentDelivery.customerPhone}...`);
    };

    return (
        <View style={styles.container}>
            {/* Map Placeholder */}
            <View style={styles.mapContainer}>
                <View style={styles.mapPlaceholder}>
                    <Ionicons name="map" size={80} color="#ccc" />
                    <Text style={styles.mapText}>Map View</Text>
                    <Text style={styles.mapSubtext}>Live navigation will be shown here</Text>
                </View>
            </View>

            {/* Delivery Info Card */}
            <View style={styles.infoCard}>
                <Text style={styles.cardTitle}>Current Delivery</Text>
                <Text style={styles.orderId}>Order #{currentDelivery.orderId}</Text>

                <View style={styles.locationSection}>
                    <View style={styles.locationItem}>
                        <View style={styles.locationPin}>
                            <Ionicons name="restaurant" size={20} color="#FF6B35" />
                        </View>
                        <View style={styles.locationInfo}>
                            <Text style={styles.locationLabel}>Restaurant</Text>
                            <Text style={styles.locationAddress}>{currentDelivery.restaurantAddress}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => openMaps(currentDelivery.restaurantAddress)}
                        >
                            <Ionicons name="navigate" size={20} color="#2196F3" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.routeLine} />

                    <View style={styles.locationItem}>
                        <View style={styles.locationPin}>
                            <Ionicons name="home" size={20} color="#4CAF50" />
                        </View>
                        <View style={styles.locationInfo}>
                            <Text style={styles.locationLabel}>Customer</Text>
                            <Text style={styles.locationAddress}>{currentDelivery.customerAddress}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={() => openMaps(currentDelivery.customerAddress)}
                        >
                            <Ionicons name="navigate" size={20} color="#2196F3" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.callButton} onPress={callCustomer}>
                    <Ionicons name="call" size={24} color="#fff" />
                    <Text style={styles.callButtonText}>Call Customer</Text>
                </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="time" size={24} color="#FF9800" />
                    <Text style={styles.actionText}>ETA: 15 min</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="speedometer" size={24} color="#2196F3" />
                    <Text style={styles.actionText}>3.2 km left</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    mapContainer: {
        flex: 1,
        backgroundColor: '#e0e0e0',
    },
    mapPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 20,
    },
    mapSubtext: {
        fontSize: 16,
        color: '#999',
        marginTop: 10,
        textAlign: 'center',
    },
    infoCard: {
        backgroundColor: '#fff',
        margin: 10,
        padding: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    orderId: {
        fontSize: 16,
        color: '#FF6B35',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    locationSection: {
        marginBottom: 20,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    locationPin: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    locationInfo: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    locationAddress: {
        fontSize: 14,
        color: '#333',
        marginTop: 2,
    },
    navButton: {
        padding: 8,
    },
    routeLine: {
        width: 2,
        height: 20,
        backgroundColor: '#ddd',
        marginLeft: 19,
        marginVertical: 5,
    },
    callButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
        paddingVertical: 15,
        borderRadius: 10,
    },
    callButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        paddingBottom: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default DeliveryMapScreen;
