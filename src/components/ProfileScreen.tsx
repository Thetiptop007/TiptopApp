import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen: React.FC = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout },
            ]
        );
    };

    const profileOptions = [
        { id: 1, title: 'Edit Profile', icon: 'person-outline', onPress: () => Alert.alert('Edit Profile', 'Coming soon!') },
        { id: 2, title: 'Change Password', icon: 'lock-closed-outline', onPress: () => Alert.alert('Change Password', 'Coming soon!') },
        { id: 3, title: 'Notifications', icon: 'notifications-outline', onPress: () => Alert.alert('Notifications', 'Coming soon!') },
        { id: 4, title: 'Help & Support', icon: 'help-circle-outline', onPress: () => Alert.alert('Help & Support', 'Coming soon!') },
        { id: 5, title: 'Privacy Policy', icon: 'shield-outline', onPress: () => Alert.alert('Privacy Policy', 'Coming soon!') },
    ];

    // Add role-specific options
    if (user?.role === 'customer') {
        profileOptions.splice(2, 0, {
            id: 6,
            title: 'Saved Addresses',
            icon: 'location-outline',
            onPress: () => Alert.alert('Saved Addresses', 'Coming soon!')
        });
    }

    if (user?.role === 'delivery') {
        profileOptions.splice(2, 0, {
            id: 7,
            title: 'Delivery Stats',
            icon: 'stats-chart-outline',
            onPress: () => Alert.alert('Delivery Stats', 'Coming soon!')
        });
    }

    return (
        <View style={styles.container}>
            {/* User Info */}
            <View style={styles.userInfoSection}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={50} color="#fff" />
                </View>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
                </View>
            </View>

            {/* Profile Options */}
            <View style={styles.optionsSection}>
                {profileOptions.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={styles.optionItem}
                        onPress={option.onPress}
                    >
                        <View style={styles.optionLeft}>
                            <Ionicons name={option.icon as any} size={24} color="#666" />
                            <Text style={styles.optionText}>{option.title}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color="#F44336" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            {/* App Info */}
            <View style={styles.appInfo}>
                <Text style={styles.appVersion}>TipTop Restaurant v1.0.0</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    userInfoSection: {
        backgroundColor: '#fff',
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FF6B35',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
    },
    roleBadge: {
        backgroundColor: '#FF6B35',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 15,
    },
    roleText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    optionsSection: {
        backgroundColor: '#fff',
        marginTop: 20,
        marginHorizontal: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 10,
        marginTop: 20,
        paddingVertical: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutText: {
        fontSize: 16,
        color: '#F44336',
        fontWeight: 'bold',
        marginLeft: 10,
    },
    appInfo: {
        alignItems: 'center',
        marginTop: 'auto',
        paddingBottom: 20,
    },
    appVersion: {
        fontSize: 12,
        color: '#999',
    },
});

export default ProfileScreen;
