import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* Background Pattern */}
            <View style={styles.backgroundPattern}>
                <View style={styles.circle1} />
                <View style={styles.circle2} />
                <View style={styles.circle3} />
                <View style={styles.circle4} />
                <View style={styles.circle5} />
                <View style={styles.circle6} />
                <View style={styles.floatingDot1} />
                <View style={styles.floatingDot2} />
                <View style={styles.floatingDot3} />
            </View>

            {/* Header Section */}
            <View style={styles.headerSection}>
                <Image
                    source={require('../../../assets/welcome.png')}
                    style={styles.welcomeImage}
                    resizeMode="contain"
                />
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Welcome to</Text>
                    <Text style={styles.brandName}>TipTop Restaurant</Text>
                    <Text style={styles.subtitle}>Delicious food delivered fresh to your doorstep</Text>
                </View>
            </View>

            {/* Buttons Section */}
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('Login' as never)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.primaryButtonText}>Get Started</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('SignUp' as never)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.secondaryButtonText}>Create Account</Text>
                </TouchableOpacity>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginPrompt}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
                        <Text style={styles.loginLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FF6B35',
    },
    backgroundPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    circle1: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -80,
        right: -80,
    },
    circle2: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        bottom: 120,
        left: -50,
    },
    circle3: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        top: height * 0.25,
        right: 10,
    },
    circle4: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        top: height * 0.6,
        left: 30,
    },
    circle5: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        top: height * 0.15,
        left: width * 0.3,
    },
    circle6: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        bottom: -60,
        right: -60,
    },
    floatingDot1: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        top: height * 0.2,
        left: width * 0.8,
    },
    floatingDot2: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        top: height * 0.4,
        left: width * 0.1,
    },
    floatingDot3: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        bottom: height * 0.3,
        right: width * 0.2,
    },
    headerSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingTop: 60,
    },
    welcomeImage: {
        width: width * 0.85,
        height: width * 0.85,
        marginBottom: 20,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '500',
        color: '#FFFFFF',
        marginBottom: 6,
        textAlign: 'center',
        fontFamily: 'System',
        letterSpacing: 0.5,
        opacity: 0.9,
    },
    brandName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 12,
        textAlign: 'center',
        fontFamily: 'System',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 14,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 20,
        fontFamily: 'System',
        paddingHorizontal: 20,
        opacity: 0.8,
    },
    buttonsContainer: {
        paddingHorizontal: 30,
        paddingBottom: 50,
    },
    primaryButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderRadius: 25,
        marginBottom: 12,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryButtonText: {
        color: '#FF6B35',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        fontFamily: 'System',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        paddingVertical: 14,
        borderRadius: 25,
        marginBottom: 20,
    },
    secondaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        fontFamily: 'System',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginPrompt: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontFamily: 'System',
    },
    loginLink: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
        fontFamily: 'System',
    },
});

export default WelcomeScreen;
