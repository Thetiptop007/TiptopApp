import { Animated } from 'react-native';

/**
 * Simple animation utilities using React Native's built-in Animated API
 * This replaces react-native-reanimated for basic animations
 */

export const AnimationUtils = {
    // Button press animation
    buttonPress: (animatedValue: Animated.Value) => {
        return Animated.sequence([
            Animated.timing(animatedValue, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }),
        ]);
    },

    // Fade in animation
    fadeIn: (animatedValue: Animated.Value, duration: number = 300) => {
        return Animated.timing(animatedValue, {
            toValue: 1,
            duration,
            useNativeDriver: true,
        });
    },

    // Fade out animation
    fadeOut: (animatedValue: Animated.Value, duration: number = 300) => {
        return Animated.timing(animatedValue, {
            toValue: 0,
            duration,
            useNativeDriver: true,
        });
    },

    // Slide in from bottom
    slideInFromBottom: (animatedValue: Animated.Value, duration: number = 300) => {
        return Animated.timing(animatedValue, {
            toValue: 0,
            duration,
            useNativeDriver: true,
        });
    },

    // Bounce animation
    bounce: (animatedValue: Animated.Value) => {
        return Animated.sequence([
            Animated.timing(animatedValue, {
                toValue: 1.1,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]);
    },

    // Loading spinner
    rotate: (animatedValue: Animated.Value) => {
        return Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            })
        );
    },
};

// Hook for simple animations
export const useAnimation = () => {
    const scale = new Animated.Value(1);
    const opacity = new Animated.Value(1);
    const translateY = new Animated.Value(0);
    const rotate = new Animated.Value(0);

    return {
        scale,
        opacity,
        translateY,
        rotate,
        animations: AnimationUtils,
    };
};
