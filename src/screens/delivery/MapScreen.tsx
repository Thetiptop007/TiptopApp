import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppHeader from '../../components/AppHeader';

const DeliveryMapScreen = () => {
    return (
        <View style={styles.container}>
            <AppHeader title="Map View" />
            <View style={styles.content}>
                <Text style={styles.title}>Map View</Text>
                <Text style={styles.subtitle}>Interactive delivery map coming soon!</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default DeliveryMapScreen;
