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

const SignUpScreen: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const navigation = useNavigation();
    const { signUp } = useAuth();

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password: string): boolean => {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    };

    const validatePhone = (phone: string): boolean => {
        // Indian phone number format
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone.replace(/[^\d]/g, ''));
    };

    const handleSignUp = async () => {
        setErrors({});
        
        // Validation
        const newErrors: { [key: string]: string } = {};

        if (!name.trim()) {
            newErrors.name = 'Name is required';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!validatePhone(phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (!validatePassword(password)) {
            newErrors.password = 'Password must be 8+ characters with uppercase, lowercase & number';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/[^\d]/g, '')}`;
            
            const result = await signUp(name.trim(), email.trim(), password, formattedPhone, 'customer');

            Alert.alert(
                'Success! 🎉',
                'Account created! Please check your email for the verification code.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            (navigation as any).navigate('VerifyOTP', {
                                email: result.email,
                                fromSignup: true,
                            });
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('Signup error:', error);
            Alert.alert('Error', error?.message || 'Sign up failed. Please try again.');
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
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Join us and enjoy delicious food!</Text>
                    </View>

                    {/* Name Input */}
                    <View style={styles.inputContainer}>
                        <View style={[styles.inputWrapper, errors.name && styles.inputError]}>
                            <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Full Name"
                                placeholderTextColor="#9CA3AF"
                                value={name}
                                onChangeText={(text) => {
                                    setName(text);
                                    setErrors((prev) => ({ ...prev, name: '' }));
                                }}
                                autoCapitalize="words"
                            />
                        </View>
                        {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
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

                    {/* Phone Input */}
                    <View style={styles.inputContainer}>
                        <View style={[styles.inputWrapper, errors.phone && styles.inputError]}>
                            <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                            <Text style={styles.phonePrefix}>+91</Text>
                            <TextInput
                                style={[styles.input, styles.phoneInput]}
                                placeholder="Phone Number"
                                placeholderTextColor="#9CA3AF"
                                value={phone}
                                onChangeText={(text) => {
                                    setPhone(text.replace(/[^\d]/g, ''));
                                    setErrors((prev) => ({ ...prev, phone: '' }));
                                }}
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        </View>
                        {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
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

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                    <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
                        <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            placeholderTextColor="#9CA3AF"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                            }}
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Ionicons
                                name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                                size={20}
                                color="#9CA3AF"
                            />
                        </TouchableOpacity>
                    </View>
                    {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
                </View>

                    {/* Sign Up Button */}
                    <TouchableOpacity
                        style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
                        onPress={handleSignUp}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="#e36057ff" />
                        ) : (
                            <Text style={styles.signUpButtonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginPrompt}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => (navigation as any).navigate('Login')}>
                            <Text style={styles.loginLink}>Sign In</Text>
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
        top: height * 0.16,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 3,
    },
    formContent: {
        paddingHorizontal: 30,
        paddingTop: 20,
        paddingBottom: 40,
    },
    formHeader: {
        marginBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 6,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    roleContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    roleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    roleButtonActive: {
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9CA3AF',
    },
    roleTextActive: {
        color: '#e36057ff',
    },
    inputContainer: {
        marginBottom: 12,
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
    phonePrefix: {
        fontSize: 16,
        color: '#111827',
        fontWeight: '500',
        marginRight: 8,
    },
    phoneInput: {
        marginLeft: 0,
    },
    errorText: {
        fontSize: 12,
        color: '#EF4444',
        marginTop: 4,
        marginLeft: 4,
    },
    signUpButton: {
        backgroundColor: '#FFF',
        paddingVertical: 14,
        borderRadius: 25,
        marginTop: 4,
        marginBottom: 16,
        shadowColor: 'rgba(0, 0, 0, 0.15)',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    signUpButtonDisabled: {
        opacity: 0.7,
    },
    signUpButtonText: {
        color: '#e36057ff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        letterSpacing: 0.5,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginPrompt: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    loginLink: {
        fontSize: 14,
        color: '#FFF',
        fontWeight: '600',
    },
});

export default SignUpScreen;
