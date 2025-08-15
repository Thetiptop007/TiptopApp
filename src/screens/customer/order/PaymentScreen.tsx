import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Animated,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../../contexts/CartContext';
import { useSwipeNavigation } from '../../../contexts/SwipeNavigationContext';

const { width } = Dimensions.get('window');

interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    type: 'card' | 'upi' | 'wallet' | 'cod';
}

const PaymentScreen: React.FC = () => {
    const { cartTotal, cartItems, clearCart } = useCart();
    const { navigateToOrder, goBackToTab } = useSwipeNavigation();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);

    const slideInAnimation = useRef(new Animated.Value(width));
    const deliveryFee = 2.99;
    const platformFee = 1.50;
    const taxes = cartTotal * 0.05; // 5% tax
    const grandTotal = cartTotal + deliveryFee + platformFee + taxes;

    // Mock saved addresses data
    const savedAddresses = [
        {
            id: '1',
            label: 'Home',
            address: '123 Main St, Downtown, Mumbai',
            phone: '+91 98765 43210',
            isDefault: true,
        },
        {
            id: '2',
            label: 'Office',
            address: '456 Business Park, Andheri East, Mumbai',
            phone: '+91 98765 43210',
            isDefault: false,
        },
        {
            id: '3',
            label: 'Friend\'s Place',
            address: '789 Residential Complex, Bandra West, Mumbai',
            phone: '+91 87654 32109',
            isDefault: false,
        },
    ];

    React.useEffect(() => {
        Animated.timing(slideInAnimation.current, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    const paymentMethods: PaymentMethod[] = [
        { id: 'upi', name: 'UPI Payment', icon: 'qr-code-outline', type: 'upi' },
        { id: 'cod', name: 'Cash on Delivery', icon: 'cash-outline', type: 'cod' },
    ];

    const handlePayment = async () => {
        if (!selectedPaymentMethod) {
            Alert.alert('Payment Method Required', 'Please select a payment method to continue');
            return;
        }

        setIsProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            setIsProcessing(false);

            // Get selected address
            const selectedAddress = savedAddresses[selectedAddressIndex];

            // Create order object
            const orderData = {
                items: cartItems,
                total: grandTotal,
                paymentMethod: selectedPaymentMethod,
                deliveryAddress: selectedAddress.address,
                addressLabel: selectedAddress.label,
                phoneNumber: selectedAddress.phone,
                timestamp: new Date().toISOString(),
            };

            console.log('Order placed:', orderData);

            // Clear cart and navigate to confirmation
            clearCart();

            Alert.alert(
                'Order Placed Successfully!',
                'Your order has been confirmed. You will receive updates on your phone.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Navigate to order confirmation screen
                            const orderId = 'ORD-' + Date.now().toString().slice(-6);
                            navigateToOrder('OrderConfirmation', {
                                orderId: orderId,
                                estimatedDeliveryTime: 30,
                                totalAmount: grandTotal
                            });
                        }
                    }
                ]
            );
        }, 2000);
    };

    const handleSelectSavedAddress = (index: number) => {
        setSelectedAddressIndex(index);
    };

    const renderPaymentMethod = (method: PaymentMethod) => (
        <TouchableOpacity
            key={method.id}
            style={[
                styles.paymentMethod,
                selectedPaymentMethod === method.id && styles.selectedPaymentMethod
            ]}
            onPress={() => setSelectedPaymentMethod(method.id)}
            activeOpacity={0.7}
        >
            <View style={styles.paymentMethodLeft}>
                <View style={[
                    styles.paymentMethodIcon,
                    selectedPaymentMethod === method.id && styles.selectedPaymentMethodIcon
                ]}>
                    <Ionicons
                        name={method.icon as any}
                        size={24}
                        color={selectedPaymentMethod === method.id ? '#FFFFFF' : '#e36057ff'}
                    />
                </View>
                <Text style={[
                    styles.paymentMethodText,
                    selectedPaymentMethod === method.id && styles.selectedPaymentMethodText
                ]}>
                    {method.name}
                </Text>
            </View>
            <View style={[
                styles.radioButton,
                selectedPaymentMethod === method.id && styles.radioButtonSelected
            ]}>
                {selectedPaymentMethod === method.id && (
                    <View style={styles.radioButtonInner} />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <Animated.View style={[
            styles.container,
            { transform: [{ translateX: slideInAnimation.current }] }
        ]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={styles.backButton}
                        activeOpacity={0.7}
                        onPress={() => navigateToOrder('Cart')}
                    >
                        <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>Payment</Text>
                        <Text style={styles.headerSubtitle}>Review & Pay</Text>
                    </View>
                </View>
                <View style={styles.headerRight} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Delivery Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Details</Text>

                    {/* Saved Addresses List */}
                    <View style={styles.savedAddressesList}>
                        {savedAddresses.map((address, index) => (
                            <TouchableOpacity
                                key={address.id}
                                style={[
                                    styles.savedAddressItem,
                                    selectedAddressIndex === index && styles.selectedSavedAddress
                                ]}
                                onPress={() => handleSelectSavedAddress(index)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.savedAddressContent}>
                                    <View style={styles.savedAddressHeader}>
                                        <Text style={styles.savedAddressLabel}>{address.label}</Text>
                                        {address.isDefault && (
                                            <View style={styles.defaultBadge}>
                                                <Text style={styles.defaultBadgeText}>Default</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.savedAddressText} numberOfLines={2}>
                                        {address.address}
                                    </Text>
                                    <Text style={styles.savedAddressPhone}>{address.phone}</Text>
                                </View>
                                <View style={[
                                    styles.radioButton,
                                    selectedAddressIndex === index && styles.radioButtonSelected
                                ]}>
                                    {selectedAddressIndex === index && (
                                        <View style={styles.radioButtonInner} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Add Address Button */}
                    <TouchableOpacity
                        style={styles.addAddressButton}
                        activeOpacity={0.7}
                        onPress={() => {
                            // Handle add new address
                            Alert.alert('Add Address', 'Add new address functionality coming soon!');
                        }}
                    >
                        <Ionicons name="add" size={20} color="#e36057ff" />
                        <Text style={styles.addAddressButtonText}>Add New Address</Text>
                    </TouchableOpacity>
                </View>

                {/* Payment Methods */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.paymentMethods}>
                        {paymentMethods.map(renderPaymentMethod)}
                    </View>
                </View>

                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.orderSummary}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Items ({cartItems.length})</Text>
                            <Text style={styles.summaryValue}>₹{cartTotal.toFixed(2)}</Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee</Text>
                            <Text style={styles.summaryValue}>₹{deliveryFee.toFixed(2)}</Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Platform Fee</Text>
                            <Text style={styles.summaryValue}>₹{platformFee.toFixed(2)}</Text>
                        </View>

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Taxes & Charges</Text>
                            <Text style={styles.summaryValue}>₹{taxes.toFixed(2)}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryTotalLabel}>Total Amount</Text>
                            <Text style={styles.summaryTotalValue}>₹{grandTotal.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            {/* Floating Place Order Button */}
            <View style={styles.placeOrderContainer}>
                <TouchableOpacity
                    style={[
                        styles.placeOrderButton,
                        (!selectedPaymentMethod || isProcessing) && styles.disabledButton
                    ]}
                    onPress={handlePayment}
                    disabled={!selectedPaymentMethod || isProcessing}
                    activeOpacity={0.8}
                >
                    <View style={styles.placeOrderContent}>
                        {isProcessing ? (
                            <>
                                <Animated.View style={styles.processingSpinner}>
                                    <Ionicons name="refresh" size={20} color="#FFFFFF" />
                                </Animated.View>
                                <Text style={styles.placeOrderText}>Processing...</Text>
                            </>
                        ) : (
                            <>
                                <View>
                                    <Text style={styles.placeOrderText}>Place Order</Text>
                                    <Text style={styles.placeOrderSubtext}>₹{grandTotal.toFixed(2)}</Text>
                                </View>
                                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        fontFamily: 'System',
        marginTop: 2,
    },
    headerRight: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100, // Adjusted for floating button
    },
    section: {
        backgroundColor: '#FFFFFF',
        marginVertical: 8,
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 16,
    },
    addAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#e36057ff',
        borderStyle: 'dashed',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: 'transparent',
        marginTop: 8,
    },
    addAddressButtonText: {
        color: '#e36057ff',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'System',
        marginLeft: 8,
    },
    savedAddressesList: {
        marginBottom: 16,
        gap: 12,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 8,
    },
    savedAddressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#F0F0F0',
        backgroundColor: '#FAFAFA',
    },
    selectedSavedAddress: {
        borderColor: '#e36057ff',
        backgroundColor: 'rgba(227, 96, 87, 0.05)',
    },
    savedAddressContent: {
        flex: 1,
        marginRight: 16,
    },
    savedAddressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    savedAddressLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginRight: 8,
    },
    defaultBadge: {
        backgroundColor: '#e36057ff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    defaultBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
        fontFamily: 'System',
    },
    savedAddressText: {
        fontSize: 14,
        color: '#1C1C1E',
        fontFamily: 'System',
        lineHeight: 20,
        marginBottom: 4,
    },
    savedAddressPhone: {
        fontSize: 12,
        color: '#8E8E93',
        fontFamily: 'System',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 16,
        color: '#1C1C1E',
        fontFamily: 'System',
        backgroundColor: '#FAFAFA',
    },
    textAreaInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    paymentMethods: {
        gap: 12,
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#F0F0F0',
        backgroundColor: '#FAFAFA',
    },
    selectedPaymentMethod: {
        borderColor: '#e36057ff',
        backgroundColor: 'rgba(227, 96, 87, 0.05)',
    },
    paymentMethodLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentMethodIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(227, 96, 87, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    selectedPaymentMethodIcon: {
        backgroundColor: '#e36057ff',
    },
    paymentMethodText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    selectedPaymentMethodText: {
        color: '#e36057ff',
    },
    radioButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D1D1D6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioButtonSelected: {
        borderColor: '#e36057ff',
    },
    radioButtonInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#e36057ff',
    },
    orderSummary: {
        gap: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#8E8E93',
        fontFamily: 'System',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 8,
    },
    summaryTotalLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    summaryTotalValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#e36057ff',
        fontFamily: 'System',
    },
    bottomSpacer: {
        height: 20, // Reduced from 100 since we have floating button now
    },
    placeOrderContainer: {
        position: 'absolute',
        bottom: 20, // Add some space from bottom
        left: 20,
        right: 20,
        paddingVertical: 10,
        backgroundColor: 'transparent', // Make background transparent for floating effect
    },
    placeOrderButton: {
        backgroundColor: '#1C1C1E',
        borderRadius: 25, // More rounded for floating effect
        paddingVertical: 18,
        paddingHorizontal: 24,
        shadowColor: '#1C1C1E',
        shadowOffset: { width: 0, height: 6 }, // Stronger shadow for floating effect
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8, // Higher elevation for Android
    },
    disabledButton: {
        backgroundColor: '#A8A8A8', // Dull gray color instead of opacity
        shadowOpacity: 0.2, // Reduce shadow for disabled state
        elevation: 4, // Lower elevation for disabled state
    },
    placeOrderContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    processingSpinner: {
        marginRight: 12,
    },
    placeOrderText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'System',
    },
    placeOrderSubtext: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'System',
        marginTop: 2,
        opacity: 0.8,
    },
});

export default PaymentScreen;
