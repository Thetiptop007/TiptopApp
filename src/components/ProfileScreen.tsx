import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
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
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Profile</Text>
            </View>

            {/* User Info Card */}
            <View style={styles.userCard}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={50} color="#FFFFFF" />
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
                    </View>
                </View>
            </View>

            {/* Profile Options */}
            <View style={styles.optionsContainer}>
                {profileOptions.map((option, index) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[
                            styles.optionCard,
                            index === profileOptions.length - 1 && { marginBottom: 0 }
                        ]}
                        onPress={option.onPress}
                        activeOpacity={0.7}
                    >
                        <View style={styles.optionContent}>
                            <View style={styles.optionIconContainer}>
                                <Ionicons name={option.icon as any} size={22} color="#1C1C1E" />
                            </View>
                            <Text style={styles.optionText}>{option.title}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
                <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            {/* App Info */}
            <View style={styles.appInfo}>
                <Text style={styles.appVersion}>TipTop Restaurant v1.0.0</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        textAlign: 'center',
    },
    userCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 15,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1C1C1E',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        shadowColor: '#1C1C1E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#8E8E93',
        fontFamily: 'System',
        marginBottom: 8,
    },
    roleBadge: {
        backgroundColor: '#6B7280',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    roleText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
        fontFamily: 'System',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    optionsContainer: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    optionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    optionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1C1C1E',
        fontFamily: 'System',
        flex: 1,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1C1C1E',
        marginHorizontal: 20,
        marginBottom: 100,
        paddingVertical: 16,
        borderRadius: 25,
        shadowColor: '#1C1C1E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    logoutText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: 8,
        fontFamily: 'System',
    },
    appInfo: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    appVersion: {
        fontSize: 12,
        color: '#8E8E93',
        fontFamily: 'System',
    },
});

export default ProfileScreen;
