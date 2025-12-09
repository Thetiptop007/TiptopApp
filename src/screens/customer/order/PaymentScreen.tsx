import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Animated,
    Dimensions,
    Linking,
    Platform,
    BackHandler,
    Modal,
    TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RazorpayCheckout from 'react-native-razorpay';
import { useCart } from '../../../contexts/CartContext';
import { useSwipeNavigation } from '../../../contexts/SwipeNavigationContext';
import { settingsAPI, AppSettings } from '../../../api/settings.api';
import { authAPI } from '../../../api/auth.api';
import { Address } from '../../../api/address.api';
import { orderAPI } from '../../../api/order.api';
import AddAddressScreen from '../main/AddAddressScreen';

const { width } = Dimensions.get('window');

interface PaymentMethod {
    id: string;
    name: string;
    icon: string;
    type: 'card' | 'upi' | 'wallet' | 'cod';
}

interface UserAddress {
    _id?: string;
    type: string;
    label?: string;
    street: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    landmark?: string;
    isDefault: boolean;
}

const PaymentScreen: React.FC = () => {
    const { cartTotal, cartItems, clearCart } = useCart();
    const { navigateToOrder, goBackToTab } = useSwipeNavigation();
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
    const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
    const [showAddAddressModal, setShowAddAddressModal] = useState(false);
    const [contactPhone, setContactPhone] = useState('');
    const [currentUser, setCurrentUser] = useState<any>(null);

    const slideInAnimation = useRef(new Animated.Value(width));
    
    const deliveryFee = settings?.deliveryCharge || 0;
    const taxAmount = settings?.taxRate ? (cartTotal * settings.taxRate / 100) : 0;
    const grandTotal = cartTotal + deliveryFee + taxAmount;
    
    // Log calculations whenever they change
    useEffect(() => {
        if (settings) {
            console.log('\n========== PRICE CALCULATION (DISPLAY) ==========');
            console.log('Cart Total (Items):', cartTotal);
            console.log('Delivery Fee:', deliveryFee);
            console.log('Tax Rate:', settings.taxRate, '%');
            console.log('Tax Amount:', taxAmount);
            console.log('Grand Total:', grandTotal);
            console.log('===============================================\n');
        }
    }, [cartTotal, deliveryFee, taxAmount, grandTotal, settings]);

    // Fetch user addresses and settings
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('\n========== PAYMENT SCREEN INITIALIZED ==========');
                console.log('Cart Items Count:', cartItems.length);
                console.log('Cart Items:', JSON.stringify(cartItems.map(item => ({
                    id: item.menuItem._id || item.menuItem.id,
                    name: item.menuItem.name,
                    price: item.menuItem.price,
                    quantity: item.quantity,
                    itemTotal: item.menuItem.price * item.quantity
                })), null, 2));
                console.log('Cart Total (from context):', cartTotal);
                console.log('================================================\n');
                
                // Fetch user profile with addresses
                const userResponse = await authAPI.getMe();
                
                // Handle both response.user and response.data.user structures
                const user = userResponse.data?.user || userResponse.user;
                setCurrentUser(user);
                
                const addresses = user?.addresses || [];
                console.log('Addresses count:', addresses.length);
                setUserAddresses(addresses);
                
                // Set default phone number - handle string or object structure
                let phoneNumber = '';
                if (user?.phone) {
                    if (typeof user.phone === 'string') {
                        phoneNumber = user.phone;
                    } else if (user.phone.number) {
                        // Ignore isVerified check as requested
                        phoneNumber = user.phone.number;
                    }
                }
                // Remove +91 country code if present (India only)
                phoneNumber = phoneNumber.replace(/^\+91/, '').trim();
                console.log('Final contact phone:', phoneNumber);
                setContactPhone(phoneNumber);
                
                // Set default address as selected
                const defaultIndex = addresses.findIndex((addr: UserAddress) => addr.isDefault);
                if (defaultIndex !== -1) {
                    setSelectedAddressIndex(defaultIndex);
                }
                
                // Fetch settings
                const settingsResponse = await settingsAPI.getSettings();
                setSettings(settingsResponse.data.settings);
                
                console.log('\n========== SETTINGS LOADED ==========');
                console.log('Delivery Fee:', settingsResponse.data.settings.deliveryCharge);
                console.log('Tax Rate:', settingsResponse.data.settings.taxRate, '%');
                console.log('====================================\n');
            } catch (error) {
                console.error('Error fetching data:', error);
                Alert.alert('Error', 'Failed to load delivery details');
            } finally {
                setIsLoadingAddresses(false);
            }
        };
        
        fetchData();
    }, []);

    // Handle hardware back button press
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            navigateToOrder('Cart');
            return true; // Prevent default behavior (app exit)
        });

        return () => backHandler.remove();
    }, [navigateToOrder]);

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
        if (userAddresses.length === 0) {
            Alert.alert('Address Required', 'Please add a delivery address to continue');
            return;
        }

        if (!selectedPaymentMethod) {
            Alert.alert('Payment Method Required', 'Please select a payment method to continue');
            return;
        }

        if (!contactPhone || contactPhone.trim().length < 10) {
            Alert.alert('Phone Required', 'Please enter a valid phone number (at least 10 digits)');
            return;
        }

        setIsProcessing(true);

        // Get selected address
        const selectedAddress = userAddresses[selectedAddressIndex];

        console.log('\n========== ORDER PREPARATION ==========');
        console.log('Cart Items Count:', cartItems.length);
        cartItems.forEach((item, idx) => {
            console.log(`\nCart Item ${idx + 1}:`);
            console.log('  - ID:', item.menuItem.id || item.menuItem._id);
            console.log('  - Name:', item.menuItem.name);
            console.log('  - Price:', item.menuItem.price);
            console.log('  - Quantity:', item.quantity);
            console.log('  - PORTION:', item.menuItem.portion);
            console.log('  - Full menuItem:', JSON.stringify(item.menuItem, null, 2));
        });
        console.log('Selected Address:', JSON.stringify(selectedAddress, null, 2));
        console.log('Payment Method:', selectedPaymentMethod);
        console.log('Contact Phone:', contactPhone);

        // Prepare order data
        const orderData = {
            items: cartItems.map(item => {
                const orderItem = {
                    menuItem: item.menuItem.id || item.menuItem._id,
                    quantity: item.quantity,
                    price: item.menuItem.price,
                    portion: item.menuItem.portion, // Include portion/variant info
                    customizations: [],
                };
                console.log('\n📦 Mapped Order Item:', JSON.stringify(orderItem, null, 2));
                return orderItem;
            }),
            deliveryAddress: {
                street: selectedAddress.street,
                apartment: selectedAddress.apartment,
                city: selectedAddress.city,
                state: selectedAddress.state,
                zipCode: selectedAddress.zipCode,
                landmark: selectedAddress.landmark,
            },
            paymentMethod: selectedPaymentMethod.toUpperCase(),
            contactPhone,
        };

        console.log('========== FINAL ORDER DATA ==========');
        console.log(JSON.stringify(orderData, null, 2));
        console.log('======================================');

        // If UPI payment is selected, use Razorpay
        if (selectedPaymentMethod === 'upi') {
            try {
                // Create order on backend to get Razorpay order ID
                const orderId = 'order_' + Date.now();
                
                // Razorpay options
                const options = {
                    description: 'Order Payment - TipTop Restaurant',
                    image: 'https://i.imgur.com/3g7nmJC.png', // Replace with your logo URL
                    currency: 'INR',
                    key: 'rzp_test_YOUR_KEY_HERE', // Replace with your Razorpay Key ID from dashboard
                    amount: Math.round(grandTotal * 100), // Amount in paise (multiply by 100)
                    name: 'TipTop Restaurant',
                    order_id: orderId, // In production, generate this from your backend
                    prefill: {
                        email: 'customer@example.com',
                        contact: selectedAddress.phone.replace(/\s/g, ''),
                        name: selectedAddress.label,
                    },
                    theme: { color: '#e36057' },
                };

                // Open Razorpay checkout
                RazorpayCheckout.open(options)
                    .then((data: any) => {
                        // Payment successful
                        console.log('Payment Success:', data);
                        handlePaymentSuccess(data, selectedAddress);
                    })
                    .catch((error: any) => {
                        // Payment failed or cancelled
                        setIsProcessing(false);
                        console.log('Payment Error:', error);
                        
                        if (error.code === 0) {
                            // User cancelled the payment
                            Alert.alert('Payment Cancelled', 'You cancelled the payment.');
                        } else if (error.code === 2) {
                            // Payment failed
                            Alert.alert(
                                'Payment Failed',
                                error.description || 'Transaction failed. Please try again.',
                                [{ text: 'OK' }]
                            );
                        } else {
                            // Other errors
                            Alert.alert(
                                'Payment Error',
                                'Something went wrong. Please try again.',
                                [{ text: 'OK' }]
                            );
                        }
                    });
            } catch (error) {
                setIsProcessing(false);
                Alert.alert('Payment Error', 'Something went wrong. Please try again.');
                console.error('Razorpay Error:', error);
            }
        } else {
            // Cash on Delivery - directly create order
            handlePaymentSuccess(null, selectedAddress);
        }
    };

    const handlePaymentSuccess = async (response: any, selectedAddress: any) => {
        try {
            console.log('========== PAYMENT SUCCESS - CREATING ORDER ==========');
            console.log('Payment Response:', response);
            
            // Prepare order data for backend
            const orderData = {
                items: cartItems.map(item => ({
                    menuItem: item.menuItem.id || item.menuItem._id,
                    quantity: item.quantity,
                    price: item.menuItem.price,
                    portion: item.menuItem.portion, // Include portion/variant info
                    customizations: [],
                })),
                deliveryAddress: {
                    street: selectedAddress.street,
                    apartment: selectedAddress.apartment,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    zipCode: selectedAddress.zipCode,
                    landmark: selectedAddress.landmark,
                },
                paymentMethod: selectedPaymentMethod.toUpperCase(),
                paymentDetails: response ? {
                    transactionId: response.razorpay_payment_id,
                    gateway: 'razorpay',
                    method: 'UPI',
                    timestamp: new Date(),
                } : undefined,
                contactPhone,
            };

            console.log('\n========== ORDER PAYLOAD TO BACKEND ==========');
            console.log('Order Data:', JSON.stringify(orderData, null, 2));
            console.log('\nItems Summary:');
            orderData.items.forEach((item, idx) => {
                console.log(`  Item ${idx + 1}: ${item.quantity}x @ ₹${item.price} = ₹${item.price * item.quantity}`);
            });
            const calculatedItemsTotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            console.log('Items Total (calculated):', calculatedItemsTotal);
            console.log('Expected Delivery Fee:', deliveryFee);
            console.log('Expected Tax:', taxAmount);
            console.log('Expected Grand Total:', grandTotal);
            console.log('=============================================\n');

            // Create order in backend
            const orderResponse = await orderAPI.createOrder(orderData);
            
            console.log('\n========== BACKEND ORDER RESPONSE ==========');
            console.log('Success:', orderResponse.success);
            console.log('Order Number:', orderResponse.data?.orderNumber);
            console.log('Order Pricing:', JSON.stringify(orderResponse.data?.pricing, null, 2));
            console.log('Order Items:', JSON.stringify(orderResponse.data?.items?.map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.subtotal
            })), null, 2));
            console.log('==========================================\n');
            
            console.log('========== ORDER CREATED SUCCESSFULLY ==========');
            console.log('Order Response:', JSON.stringify(orderResponse, null, 2));
            console.log('===============================================');
            
            // Clear cart
            clearCart();
            
            setIsProcessing(false);
            
            // Navigate directly to confirmation screen
            navigateToOrder('OrderConfirmation', {
                orderId: orderResponse.data.order.orderNumber,
                orderNumber: orderResponse.data.order.orderNumber,
                estimatedDeliveryTime: 30,
                totalAmount: orderResponse.data.order.pricing.finalAmount,
                paymentMethod: selectedPaymentMethod.toUpperCase(),
            });
        } catch (error: any) {
            setIsProcessing(false);
            console.error('Error creating order:', error);
            // Show simple error without blocking UI
            Alert.alert('Order Failed', error?.message || 'Failed to create order. Please try again.');
        }
    };

    const handleSelectSavedAddress = (index: number) => {
        setSelectedAddressIndex(index);
    };

    const handleAddAddress = () => {
        setShowAddAddressModal(true);
    };

    const handleAddressAdded = async (newAddress: Address) => {
        try {
            // Refresh addresses from backend to get the saved address
            const userResponse = await authAPI.getMe();
            const addresses = userResponse.user?.addresses || [];
            setUserAddresses(addresses);
            
            // Select the newly added address (last one)
            setSelectedAddressIndex(addresses.length - 1);
            
            console.log('Address added successfully, total addresses:', addresses.length);
        } catch (error) {
            console.error('Error refreshing addresses:', error);
            // Fallback to local state update
            setUserAddresses((prev) => [...prev, newAddress as UserAddress]);
            setSelectedAddressIndex(userAddresses.length);
        }
    };

    const formatAddress = (address: UserAddress): string => {
        const parts = [
            address.apartment,
            address.street,
            address.landmark,
            address.city,
            address.state,
            address.zipCode
        ].filter(Boolean);
        return parts.join(', ');
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
                {/* Contact Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    <Text style={styles.sectionHelper}>Your phone number (editable for delivery)</Text>
                    <View style={styles.phoneInputContainer}>
                        <Ionicons name="call-outline" size={20} color="#8E8E93" style={styles.phoneIcon} />
                        <TextInput
                            style={styles.phoneInput}
                            value={contactPhone}
                            onChangeText={setContactPhone}
                            placeholder="Enter phone number for delivery"
                            placeholderTextColor="#8E8E93"
                            keyboardType="phone-pad"
                            maxLength={15}
                        />
                    </View>
                </View>

                {/* Delivery Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Details</Text>

                    {isLoadingAddresses ? (
                        <View style={styles.loadingContainer}>
                            <Ionicons name="refresh" size={24} color="#8E8E93" />
                            <Text style={styles.loadingText}>Loading addresses...</Text>
                        </View>
                    ) : userAddresses.length > 0 ? (
                        <>
                            {/* Saved Addresses List */}
                            <View style={styles.savedAddressesList}>
                                {userAddresses.map((address, index) => (
                                    <TouchableOpacity
                                        key={address._id || index}
                                        style={[
                                            styles.savedAddressItem,
                                            selectedAddressIndex === index && styles.selectedSavedAddress
                                        ]}
                                        onPress={() => handleSelectSavedAddress(index)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.savedAddressContent}>
                                            <View style={styles.savedAddressHeader}>
                                                <Text style={styles.savedAddressLabel}>
                                                    {address.label || address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                                                </Text>
                                                {address.isDefault && (
                                                    <View style={styles.defaultBadge}>
                                                        <Text style={styles.defaultBadgeText}>Default</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={styles.savedAddressText} numberOfLines={2}>
                                                {formatAddress(address)}
                                            </Text>
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
                                onPress={handleAddAddress}
                            >
                                <Ionicons name="add" size={20} color="#e36057ff" />
                                <Text style={styles.addAddressButtonText}>Add New Address</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={styles.noAddressContainer}>
                            <Ionicons name="location-outline" size={48} color="#8E8E93" />
                            <Text style={styles.noAddressTitle}>No Delivery Address</Text>
                            <Text style={styles.noAddressText}>Please add a delivery address to continue</Text>
                            <TouchableOpacity
                                style={styles.addFirstAddressButton}
                                activeOpacity={0.7}
                                onPress={handleAddAddress}
                            >
                                <Ionicons name="add" size={20} color="#FFFFFF" />
                                <Text style={styles.addFirstAddressButtonText}>Add Address</Text>
                            </TouchableOpacity>
                        </View>
                    )}
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
                        {/* Itemized List */}
                        {cartItems.map((item) => (
                            <View key={item.id} style={styles.summaryItemRow}>
                                <Text style={styles.summaryItemText} numberOfLines={1}>
                                    {item.menuItem.name}
                                    {item.menuItem.portion && ` (${item.menuItem.portion})`}
                                    <Text style={styles.summaryItemQty}> x{item.quantity}</Text>
                                </Text>
                                <Text style={styles.summaryItemValue}>
                                    ₹{(item.menuItem.price * item.quantity).toFixed(0)}
                                </Text>
                            </View>
                        ))}

                        <View style={styles.summaryDivider} />

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Item Total</Text>
                            <Text style={styles.summaryValue}>₹{cartTotal.toFixed(0)}</Text>
                        </View>

                        {deliveryFee > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Delivery Charge</Text>
                                <Text style={styles.summaryValue}>₹{deliveryFee.toFixed(0)}</Text>
                            </View>
                        )}

                        {taxAmount > 0 && (
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Tax ({settings?.taxRate}%)</Text>
                                <Text style={styles.summaryValue}>₹{taxAmount.toFixed(0)}</Text>
                            </View>
                        )}

                        <View style={styles.summaryDivider} />

                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryTotalLabel}>Total Amount</Text>
                            <Text style={styles.summaryTotalValue}>₹{grandTotal.toFixed(0)}</Text>
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
                                <View style={styles.loadingDots}>
                                    <View style={[styles.dot, styles.dot1]} />
                                    <View style={[styles.dot, styles.dot2]} />
                                    <View style={[styles.dot, styles.dot3]} />
                                </View>
                                <Text style={styles.placeOrderText}>Placing Order</Text>
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

            {/* Add Address Modal */}
            <Modal
                visible={showAddAddressModal}
                animationType="slide"
                presentationStyle="fullScreen"
            >
                <AddAddressScreen
                    onClose={() => setShowAddAddressModal(false)}
                    onAddressAdded={handleAddressAdded}
                />
            </Modal>
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
        gap: 8,
    },
    summaryItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryItemText: {
        fontSize: 13,
        color: '#3C3C43',
        fontFamily: 'System',
        flex: 1,
        marginRight: 8,
    },
    summaryItemQty: {
        fontWeight: '600',
        color: '#1C1C1E',
    },
    summaryItemValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    summaryDivider: {
        height: 1,
        backgroundColor: '#E5E5E7',
        marginVertical: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#8E8E93',
        fontFamily: 'System',
    },
    summaryValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 8,
    },
    sectionHelper: {
        fontSize: 13,
        color: '#8E8E93',
        fontFamily: 'System',
        marginBottom: 12,
        marginTop: -8,
    },
    phoneInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: '#E5E5E7',
    },
    phoneIcon: {
        marginRight: 12,
    },
    phoneInput: {
        flex: 1,
        fontSize: 15,
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#8E8E93',
        fontFamily: 'System',
    },
    noAddressContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
    },
    noAddressTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginTop: 16,
        marginBottom: 8,
    },
    noAddressText: {
        fontSize: 14,
        color: '#8E8E93',
        fontFamily: 'System',
        textAlign: 'center',
        marginBottom: 24,
    },
    addFirstAddressButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e36057ff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
        gap: 8,
    },
    addFirstAddressButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'System',
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
    loadingDots: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 2,
    },
    dot1: {
        opacity: 0.4,
    },
    dot2: {
        opacity: 0.7,
    },
    dot3: {
        opacity: 1,
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
