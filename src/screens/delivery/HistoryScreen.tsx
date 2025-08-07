import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AppHeader from '../../components/AppHeader';

const DeliveryHistoryScreen = () => {
    return (
        <View style={styles.container}>
            <AppHeader title="Delivery History" />
            <ScrollView style={styles.content}>
                <View style={styles.centerContent}>
                    <Text style={styles.title}>Delivery History</Text>
                    <Text style={styles.subtitle}>Your past delivery records will appear here</Text>
                </View>
            </ScrollView>
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
        padding: 20,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
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

export default DeliveryHistoryScreen;
