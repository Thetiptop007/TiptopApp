import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
    console.log('[WelcomeScreen] Rendering');
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {/* Top White Section */}
            <View style={styles.topSection}>
                {/* Background Pattern for Top */}
                <View style={styles.topBackgroundPattern}>
                    <View style={styles.topCircle1} />
                    <View style={styles.topCircle2} />
                    <View style={styles.topFloatingDot1} />
                    <View style={styles.topFloatingDot2} />
                </View>

                {/* Restaurant Logo Section */}
                <View style={styles.logoSection}>
                    <Image
                        source={require('../../../assets/logo-full.png')}
                        style={styles.restaurantLogo}
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* Bottom Colored Section */}
            <View style={styles.bottomSection}>
                {/* Background Pattern for Bottom */}
                <View style={styles.bottomBackgroundPattern}>
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
            </View>

            {/* Wave Separator */}
            <View style={styles.waveSeparator}>
                <Svg
                    height="100"
                    width={width}
                    viewBox={`0 0 ${width} 100`}
                    style={styles.wave}
                >
                    <Path
                        d={`M0,20 Q${width * 0.25},50 ${width * 0.5},25 T${width},30 L${width},100 L0,100 Z`}
                        fill="#e36057ff"
                    />
                </Svg>
            </View>

            {/* Content Sections */}
            {/* Welcome Image - Independent and Floating */}
            <View style={styles.welcomeImageContainer}>
                <Image
                    source={require('../../../assets/welcome.png')}
                    style={styles.welcomeImage}
                    resizeMode="contain"
                />
            </View>

            {/* Text Content - Removed the welcome text */}
            <View style={styles.headerSection}>
                {/* Text content removed */}
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
        backgroundColor: '#f8f9faff', // Off-white background
    },
    // Top Section (30% - Off White)
    topSection: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.48, // Increased from 0.42 to 0.48
        backgroundColor: '#f8f9faff',
        zIndex: 1,
    },
    topBackgroundPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    topCircle1: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(227, 96, 87, 0.06)',
        top: -60,
        right: -40,
    },
    topCircle2: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(227, 96, 87, 0.04)',
        top: height * 0.08,
        left: -30,
    },
    topFloatingDot1: {
        position: 'absolute',
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(227, 96, 87, 0.2)',
        top: height * 0.1,
        right: width * 0.3,
    },
    topFloatingDot2: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(227, 96, 87, 0.15)',
        top: height * 0.15,
        left: width * 0.7,
    },
    // Logo Section
    logoSection: {
        position: 'absolute',
        top: height * 0.18, // Centered in white section (48% height, so middle is around 24%, adjusted to 18%)
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    restaurantLogo: {
        width: width * 0.8, // Increased from 0.6 to 0.8
        height: 70, // Increased from 50 to 70
    },
    // Bottom Section (70% - Brand Color)
    bottomSection: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.62, // Adjusted from 0.68 to 0.62
        backgroundColor: '#e36057ff',
        zIndex: 0,
    },
    bottomBackgroundPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
    },
    // Wave Separator
    waveSeparator: {
        position: 'absolute',
        top: height * 0.38, // Moved lower from 0.32 to 0.38
        left: 0,
        right: 0,
        height: 100,
        zIndex: 2,
    },
    wave: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    // Existing background pattern styles for bottom section
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
        top: height * 0.1,
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
        top: height * 0.15,
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
        top: height * 0.05,
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
        top: height * 0.1,
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
    // Content Sections
    welcomeImageContainer: {
        position: 'absolute',
        top: height * 0.25, // Moved down from 0.08 to 0.25 (closer to separation line)
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 4, // Above everything else
    },
    welcomeImage: {
        width: width * 0.9, // Decreased back to 0.9
        height: width * 0.9, // Decreased back to 0.9
    },
    headerSection: {
        position: 'absolute',
        top: height * 0.50, // Adjusted position
        left: 0,
        right: 0,
        height: height * 0.15, // Reduced height since no text
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        zIndex: 3,
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
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 30,
        paddingBottom: 50,
        zIndex: 3,
    },
    // Clean Button Styles
    primaryButton: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 25,
        marginBottom: 16,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryButtonText: {
        color: '#e36057ff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        fontFamily: 'System',
        letterSpacing: 0.5,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 25,
        marginBottom: 20,
    },
    secondaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        fontFamily: 'System',
        letterSpacing: 0.5,
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
