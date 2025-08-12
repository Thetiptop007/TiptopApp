import React, { useEffect, useState } from 'react';
import {
    View,
    Image,
    Dimensions,
    StyleSheet,
    Animated,
    StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface CustomSplashScreenProps {
    onFinish: () => void;
}

const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({ onFinish }) => {
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.8));

    useEffect(() => {
        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto-dismiss after 2.5 seconds
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                onFinish();
            });
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <LinearGradient
                colors={['#FFFFFF', '#F8F9FA', '#F15800', '#E83E01']}
                locations={[0, 0.25, 0.75, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Abstract background elements */}
                <View style={styles.backgroundElements}>
                    {/* Large circle top right */}
                    <View style={[styles.circle, styles.circle1]} />
                    {/* Medium circle bottom left */}
                    <View style={[styles.circle, styles.circle2]} />
                    {/* Small circle center right */}
                    <View style={[styles.circle, styles.circle3]} />

                    {/* Flowing waves */}
                    <View style={styles.waveContainer}>
                        <View style={[styles.wave, styles.wave1]} />
                        <View style={[styles.wave, styles.wave2]} />
                    </View>

                    {/* Tech elements */}
                    <View style={styles.techElements}>
                        <View style={[styles.hexagon, { top: height * 0.15, left: width * 0.1 }]} />
                        <View style={[styles.hexagon, { top: height * 0.6, right: width * 0.15 }]} />
                        <View style={[styles.hexagon, { bottom: height * 0.25, left: width * 0.2 }]} />
                    </View>

                    {/* Subtle mesh lines */}
                    <View style={styles.meshLines}>
                        <View style={[styles.line, styles.horizontalLine1]} />
                        <View style={[styles.line, styles.horizontalLine2]} />
                        <View style={[styles.line, styles.verticalLine1]} />
                        <View style={[styles.line, styles.verticalLine2]} />
                    </View>
                </View>

                {/* Logo in center */}
                <Animated.View
                    style={[
                        styles.logoContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <Image
                        source={require('../../assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backgroundElements: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    circle: {
        position: 'absolute',
        borderRadius: 1000,
    },
    circle1: {
        width: width * 0.8,
        height: width * 0.8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        top: -width * 0.3,
        right: -width * 0.3,
    },
    circle2: {
        width: width * 0.5,
        height: width * 0.5,
        backgroundColor: 'rgba(241, 88, 0, 0.08)',
        bottom: height * 0.1,
        left: -width * 0.15,
    },
    circle3: {
        width: width * 0.3,
        height: width * 0.3,
        backgroundColor: 'rgba(232, 62, 1, 0.06)',
        top: height * 0.45,
        right: width * 0.05,
    },
    waveContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.25,
    },
    wave: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    wave1: {
        height: '100%',
        backgroundColor: 'rgba(241, 88, 0, 0.03)',
        borderTopLeftRadius: width,
        borderTopRightRadius: width,
        transform: [{ scaleX: 1.3 }],
    },
    wave2: {
        height: '70%',
        backgroundColor: 'rgba(232, 62, 1, 0.02)',
        borderTopLeftRadius: width * 0.8,
        borderTopRightRadius: width * 0.8,
        transform: [{ scaleX: 1.6 }],
    },
    techElements: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    hexagon: {
        position: 'absolute',
        width: 20,
        height: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        transform: [{ rotate: '30deg' }],
    },
    meshLines: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    line: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    horizontalLine1: {
        height: 1,
        width: '100%',
        top: height * 0.3,
    },
    horizontalLine2: {
        height: 1,
        width: '100%',
        top: height * 0.7,
    },
    verticalLine1: {
        width: 1,
        height: '100%',
        left: width * 0.25,
    },
    verticalLine2: {
        width: 1,
        height: '100%',
        right: width * 0.25,
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    logo: {
        width: width * 0.4,
        height: width * 0.4,
        maxWidth: 200,
        maxHeight: 200,
    },
});

export default CustomSplashScreen;
