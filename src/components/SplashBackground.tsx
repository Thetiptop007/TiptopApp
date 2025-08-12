import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashBackground: React.FC = () => {
    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#FFFFFF', '#F8F9FA', '#F15800', '#E83E01']}
                locations={[0, 0.3, 0.7, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                {/* Abstract circles */}
                <View style={[styles.circle, styles.circle1]} />
                <View style={[styles.circle, styles.circle2]} />
                <View style={[styles.circle, styles.circle3]} />

                {/* Flowing waves effect */}
                <View style={styles.waveContainer}>
                    <View style={[styles.wave, styles.wave1]} />
                    <View style={[styles.wave, styles.wave2]} />
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: width,
        height: height,
    },
    gradient: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    circle: {
        position: 'absolute',
        borderRadius: 1000,
        opacity: 0.1,
    },
    circle1: {
        width: width * 0.6,
        height: width * 0.6,
        backgroundColor: '#FFFFFF',
        top: -width * 0.2,
        right: -width * 0.2,
    },
    circle2: {
        width: width * 0.4,
        height: width * 0.4,
        backgroundColor: '#F15800',
        bottom: height * 0.2,
        left: -width * 0.1,
    },
    circle3: {
        width: width * 0.3,
        height: width * 0.3,
        backgroundColor: '#E83E01',
        top: height * 0.4,
        right: width * 0.1,
    },
    waveContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.3,
    },
    wave: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        opacity: 0.05,
    },
    wave1: {
        backgroundColor: '#F15800',
        borderTopLeftRadius: width,
        borderTopRightRadius: width,
        transform: [{ scaleX: 1.2 }],
    },
    wave2: {
        backgroundColor: '#E83E01',
        borderTopLeftRadius: width * 0.8,
        borderTopRightRadius: width * 0.8,
        height: '80%',
        transform: [{ scaleX: 1.5 }],
    },
});

export default SplashBackground;
