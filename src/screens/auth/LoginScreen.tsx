import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole>('customer');

    const navigation = useNavigation();
    const { login } = useAuth();

    const handleLogin = async () => {
        // For testing purposes - auto login without validation
        try {
            // Use dummy credentials for testing
            const testEmail = selectedRole === 'admin' ? 'admin@test.com' :
                selectedRole === 'delivery' ? 'delivery@test.com' : 'customer@test.com';
            await login(testEmail, 'password123', selectedRole);
        } catch (error) {
            Alert.alert('Error', 'Login failed. Please try again.');
        }
    };

    const roles: { value: UserRole; label: string }[] = [
        { value: 'customer', label: 'Customer' },
        { value: 'admin', label: 'Admin' },
        { value: 'delivery', label: 'Delivery Person' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login (Test Mode)</Text>

            <View style={styles.testModeInfo}>
                <Text style={styles.testModeText}>
                    🧪 Test Mode: Just select a role and click login!
                </Text>
            </View>

            <TextInput
                style={[styles.input, styles.disabledInput]}
                placeholder="Email (Not required for testing)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
            />

            <TextInput
                style={[styles.input, styles.disabledInput]}
                placeholder="Password (Not required for testing)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={false}
            />

            <Text style={styles.roleLabel}>Select Role:</Text>
            <View style={styles.roleContainer}>
                {roles.map((role) => (
                    <TouchableOpacity
                        key={role.value}
                        style={[
                            styles.roleButton,
                            selectedRole === role.value && styles.selectedRole,
                        ]}
                        onPress={() => setSelectedRole(role.value)}
                    >
                        <Text
                            style={[
                                styles.roleText,
                                selectedRole === role.value && styles.selectedRoleText,
                            ]}
                        >
                            {role.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>
                    Login as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate('SignUp' as never)}
            >
                <Text style={styles.linkText}>Don't have an account? Sign up</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    roleLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    roleButton: {
        flex: 1,
        padding: 10,
        margin: 5,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        alignItems: 'center',
    },
    selectedRole: {
        backgroundColor: '#FF6B35',
        borderColor: '#FF6B35',
    },
    roleText: {
        fontSize: 12,
        color: '#666',
    },
    selectedRoleText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#FF6B35',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: '#FF6B35',
        fontSize: 16,
    },
    testModeInfo: {
        backgroundColor: '#E8F5E8',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#90EE90',
    },
    testModeText: {
        color: '#2E7D32',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '500',
    },
    disabledInput: {
        backgroundColor: '#f5f5f5',
        color: '#999',
    },
});

export default LoginScreen;
