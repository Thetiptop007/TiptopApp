import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen: React.FC = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to TipTop Restaurant</Text>
            <Text style={styles.subtitle}>Your favorite food delivered fresh</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('Login' as never)}
            >
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => navigation.navigate('SignUp' as never)}
            >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>Sign Up</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 50,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#FF6B35',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        marginVertical: 10,
        width: 200,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#FF6B35',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    secondaryButtonText: {
        color: '#FF6B35',
    },
});

export default WelcomeScreen;
