import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

const SignUpScreen: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole>('customer');

    const navigation = useNavigation();
    const { signUp } = useAuth();

    const handleSignUp = async () => {
        if (!name || !email || !phone || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            await signUp(name, email, password, phone, selectedRole);
        } catch (error) {
            Alert.alert('Error', 'Sign up failed. Please try again.');
        }
    };

    const roles: { value: UserRole; label: string }[] = [
        { value: 'customer', label: 'Customer' },
        { value: 'admin', label: 'Admin' },
        { value: 'delivery', label: 'Delivery Person' },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign Up</Text>

            <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
            />

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
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

            <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate('Login' as never)}
            >
                <Text style={styles.linkText}>Already have an account? Login</Text>
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
});

export default SignUpScreen;
