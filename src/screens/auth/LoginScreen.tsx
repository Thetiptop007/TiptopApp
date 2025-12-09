import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Dimensions,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

type UserRole = 'customer' | 'delivery';

const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const navigation = useNavigation();
    const { login } = useAuth();

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleLogin = async () => {
        setErrors({});

        // Validation
        const newErrors: { [key: string]: string } = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const result = await login(email.trim(), password);

            // Check if account needs verification
            if (result.needsVerification) {
                Alert.alert(
                    'Email Not Verified',
                    'Your email is not verified yet. Please check your email for the verification code.',
                    [
                        {
                            text: 'Verify Now',
                            onPress: () => {
                                (navigation as any).navigate('VerifyOTP', {
                                    email: result.email || email.trim(),
                                    fromSignup: false,
                                });
                            },
                        },
                        {
                            text: 'Cancel',
                            style: 'cancel',
                        },
                    ]
                );
            }
            // If no needsVerification, login was successful and navigation handled by AuthContext
        } catch (error: any) {
            console.error('Login error:', error);
            Alert.alert('Error', error?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Top White Section */}
                <View style={styles.topSection}>
                    <View style={styles.topBackgroundPattern}>
                        <View style={styles.topCircle1} />
                        <View style={styles.topCircle2} />
                        <View style={styles.topFloatingDot1} />
                        <View style={styles.topFloatingDot2} />
                    </View>

                    {/* Logo */}
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
                    <View style={styles.bottomBackgroundPattern}>
                        <View style={styles.circle1} />
                        <View style={styles.circle2} />
                        <View style={styles.circle3} />
                        <View style={styles.floatingDot1} />
                        <View style={styles.floatingDot2} />
                    </View>
                </View>

                {/* Wave Separator */}
                <View style={styles.waveSeparator}>
                    <Svg height="120" width={width} viewBox={`0 0 ${width} 120`}>
                        <Path
                            d={`M0,60 Q${width * 0.25},20 ${width * 0.5},50 T${width},40 L${width},120 L0,120 Z`}
                            fill="#e36057ff"
                        />
                    </Svg>
                </View>

                {/* Form Content */}
                <ScrollView
                    style={styles.formContainer}
                    contentContainerStyle={styles.formContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.formHeader}>
                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue</Text>
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                        <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setErrors((prev) => ({ ...prev, email: '' }));
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#9CA3AF"
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setErrors((prev) => ({ ...prev, password: '' }));
                                }}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                                    size={20}
                                    color="#9CA3AF"
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                    </View>

                    {/* Forgot Password */}
                    <TouchableOpacity style={styles.forgotPasswordButton}>
                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.loginButtonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    {/* Sign Up Link */}
                    <View style={styles.signupContainer}>
                        <Text style={styles.signupPrompt}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => (navigation as any).navigate('SignUp')}>
                            <Text style={styles.signupLink}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9faff',
    },
    topSection: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.75,
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
    logoSection: {
        position: 'absolute',
        top: height * 0.08,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    restaurantLogo: {
        width: width * 0.7,
        height: 60,
    },
    bottomSection: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.25 + 60,
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
    circle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        top: 50,
        right: -60,
    },
    circle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        bottom: -40,
        left: -40,
    },
    circle3: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        top: 50,
        left: 30,
    },
    floatingDot1: {
        position: 'absolute',
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        top: 80,
        right: width * 0.2,
    },
    floatingDot2: {
        position: 'absolute',
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        bottom: 30,
        right: width * 0.15,
    },
    waveSeparator: {
        position: 'absolute',
        top: height * 0.75 - 60,
        left: 0,
        right: 0,
        height: 120,
        zIndex: 2,
    },
    formContainer: {
        position: 'absolute',
        top: height * 0.2,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 3,
    },
    formContent: {
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 40,
    },
    formHeader: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 14,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputError: {
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
        marginLeft: 4,
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        fontSize: 14,
        color: '#e36057ff',
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: '#e36057ff',
        paddingVertical: 14,
        borderRadius: 25,
        marginBottom: 20,
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupPrompt: {
        fontSize: 14,
        color: '#6B7280',
    },
    signupLink: {
        fontSize: 14,
        color: '#e36057ff',
        fontWeight: '600',
    },
});

export default LoginScreen;
