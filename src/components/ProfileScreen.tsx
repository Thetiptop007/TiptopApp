import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useProfileNavigation } from '../hooks/useProfileNavigation';

const ProfileScreen: React.FC = () => {
    const { user, logout } = useAuth();
    const { navigateToTab } = useProfileNavigation();

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
        { id: 1, title: 'Edit Profile', icon: 'person-outline', onPress: () => navigateToTab('Profile', { screen: 'EditProfile' }) },
        { id: 4, title: 'Help & Support', icon: 'help-circle-outline', onPress: () => navigateToTab('Profile', { screen: 'HelpSupport' }) },
        { id: 5, title: 'Privacy Policy', icon: 'shield-outline', onPress: () => navigateToTab('Profile', { screen: 'PrivacyPolicy' }) },
    ];

    // Add role-specific options
    if (user?.role === 'customer') {
        profileOptions.splice(1, 0, {
            id: 6,
            title: 'Saved Addresses',
            icon: 'location-outline',
            onPress: () => navigateToTab('Profile', { screen: 'SavedAddresses' })
        });
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <Image
                    source={require('../../assets/logo-full.png')}
                    style={styles.headerLogo}
                    resizeMode="contain"
                />
            </View>

            {/* User Info Card */}
            <View style={styles.userCard}>
                <View style={styles.userCardHeader}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={40} color="#FFFFFF" />
                        </View>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <View style={styles.emailContainer}>
                        <Ionicons name="mail-outline" size={14} color="#8E8E93" />
                        <Text style={styles.userEmail}>{user?.email}</Text>
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerLogo: {
        width: 140,
        height: 60,
    },
    userCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 20,
        padding: 24,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    userCardHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        alignItems: 'center',
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#e36057ff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#e36057ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    userInfo: {
        alignItems: 'center',
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 8,
        textAlign: 'center',
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    userEmail: {
        fontSize: 14,
        color: '#8E8E93',
        fontFamily: 'System',
    },
    roleBadge: {
        backgroundColor: '#1C1C1E',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 15,
        marginTop: 12,
        shadowColor: '#1C1C1E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
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
