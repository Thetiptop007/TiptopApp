import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
    Animated,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../../contexts/CartContext';
import { useSwipeNavigation } from '../../../contexts/SwipeNavigationContext';
import { CartItem } from '../../../types';

const { width } = Dimensions.get('window');

const CartScreen: React.FC = () => {
    const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
    const { navigateToOrder, goBackToTab } = useSwipeNavigation();
    const [deliveryFee] = useState(2.99);
    const [platformFee] = useState(1.50);
    const slideInAnimation = useRef(new Animated.Value(width));

    const grandTotal = cartTotal + deliveryFee + platformFee;

    React.useEffect(() => {
        Animated.timing(slideInAnimation.current, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            Alert.alert(
                'Remove Item',
                'Are you sure you want to remove this item from cart?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => updateQuantity(itemId, 0) }
                ]
            );
        } else {
            updateQuantity(itemId, newQuantity);
        }
    };

    const handleProceedToPayment = () => {
        if (cartItems.length === 0) {
            Alert.alert('Empty Cart', 'Please add items to cart before proceeding');
            return;
        }
        // Navigate to payment screen
        navigateToOrder('Payment');
    };

    const handleClearCart = () => {
        Alert.alert(
            'Clear Cart',
            'Are you sure you want to remove all items from cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear All', style: 'destructive', onPress: clearCart }
            ]
        );
    };

    const renderCartItem = ({ item, index }: { item: CartItem; index: number }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemImageContainer}>
                {item.menuItem.image ? (
                    <Image
                        source={{ uri: item.menuItem.image }}
                        style={styles.itemImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.itemImagePlaceholder}>
                        <Ionicons name="restaurant" size={24} color="#8E8E93" />
                    </View>
                )}
            </View>

            <View style={styles.itemDetails}>
                <Text style={styles.itemName} numberOfLines={1}>{item.menuItem.name}</Text>
                <Text style={styles.itemDescription} numberOfLines={2}>{item.menuItem.description}</Text>

                <View style={styles.itemFooter}>
                    <Text style={styles.itemPrice}>₹{(item.menuItem.price * item.quantity).toFixed(2)}</Text>

                    <View style={styles.quantityControls}>
                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item.menuItem.id, item.quantity - 1)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="remove" size={16} color="#e36057ff" />
                        </TouchableOpacity>

                        <Text style={styles.quantity}>{item.quantity}</Text>

                        <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item.menuItem.id, item.quantity + 1)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add" size={16} color="#e36057ff" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => updateQuantity(item.menuItem.id, 0)}
                activeOpacity={0.7}
            >
                <Ionicons name="trash-outline" size={18} color="#F44336" />
            </TouchableOpacity>
        </View>
    );

    const renderEmptyCart = () => (
        <View style={styles.emptyCart}>
            <Ionicons name="bag-outline" size={80} color="#8E8E93" />
            <Text style={styles.emptyCartTitle}>Your cart is empty</Text>
            <Text style={styles.emptyCartSubtitle}>
                Looks like you haven't added any items to your cart yet.
            </Text>
            <TouchableOpacity
                style={styles.browseMenuButton}
                onPress={() => goBackToTab()}
                activeOpacity={0.8}
            >
                <Ionicons name="restaurant-outline" size={20} color="#FFFFFF" />
                <Text style={styles.browseMenuButtonText}>Browse Menu</Text>
            </TouchableOpacity>
        </View>
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
                        onPress={() => goBackToTab()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={24} color="#1C1C1E" />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.headerTitle}>My Cart</Text>
                        <Text style={styles.headerSubtitle}>
                            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                        </Text>
                    </View>
                </View>

                {cartItems.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={handleClearCart}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.clearButtonText}>Clear All</Text>
                    </TouchableOpacity>
                )}
            </View>

            {cartItems.length === 0 ? (
                renderEmptyCart()
            ) : (
                <View style={{ flex: 1 }}>
                    {/* Scrollable Content */}
                    <FlatList
                        data={cartItems}
                        renderItem={renderCartItem}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.cartList}
                        ListFooterComponent={
                            <View style={styles.billSummary}>
                                <Text style={styles.billTitle}>Bill Summary</Text>

                                <View style={styles.billRow}>
                                    <Text style={styles.billLabel}>Item Total</Text>
                                    <Text style={styles.billValue}>₹{cartTotal.toFixed(2)}</Text>
                                </View>

                                <View style={styles.billRow}>
                                    <Text style={styles.billLabel}>Delivery Fee</Text>
                                    <Text style={styles.billValue}>₹{deliveryFee.toFixed(2)}</Text>
                                </View>

                                <View style={styles.billRow}>
                                    <Text style={styles.billLabel}>Platform Fee</Text>
                                    <Text style={styles.billValue}>₹{platformFee.toFixed(2)}</Text>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.billRow}>
                                    <Text style={styles.billTotalLabel}>Grand Total</Text>
                                    <Text style={styles.billTotalValue}>₹{grandTotal.toFixed(2)}</Text>
                                </View>
                            </View>
                        }
                    />

                    {/* Fixed Proceed Button - Always visible at bottom */}
                    <View style={styles.proceedContainer}>
                        <TouchableOpacity
                            style={styles.proceedButton}
                            onPress={handleProceedToPayment}
                            activeOpacity={0.8}
                        >
                            <View style={styles.proceedButtonContent}>
                                <View>
                                    <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
                                    <Text style={styles.proceedButtonSubtext}>₹{grandTotal.toFixed(2)}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
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
    clearButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e36057ff',
    },
    clearButtonText: {
        color: '#e36057ff',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'System',
    },
    cartList: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100, // Adjusted for floating button
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 16,
        marginBottom: 15,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    itemImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 16,
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    itemImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F5F5F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemDetails: {
        flex: 1,
        justifyContent: 'space-between',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 12,
        color: '#8E8E93',
        fontFamily: 'System',
        lineHeight: 16,
        marginBottom: 8,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 4, // Add horizontal padding for better spacing
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#e36057ff',
        fontFamily: 'System',
        marginRight: 12, // Add margin to create space from quantity controls
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        paddingHorizontal: 4,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    quantity: {
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    removeButton: {
        padding: 8,
        alignSelf: 'flex-start',
    },
    emptyCart: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyCartTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginTop: 20,
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyCartSubtitle: {
        fontSize: 16,
        color: '#8E8E93',
        fontFamily: 'System',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    browseMenuButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e36057ff',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 25,
        shadowColor: '#e36057ff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    browseMenuButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'System',
        marginLeft: 8,
    },
    billSummary: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 0, // Remove horizontal margin to match cart items width
        marginTop: 10,
        marginBottom: 20,
        padding: 20,
        borderRadius: 15,
        shadowColor: '#2C2C2E',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    billTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
        marginBottom: 20, // Increased margin for better spacing
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16, // Increased spacing between rows
    },
    billLabel: {
        fontSize: 15, // Slightly larger text
        color: '#6B7280', // Softer gray color
        fontFamily: 'System',
        fontWeight: '500', // Medium weight for better readability
    },
    billValue: {
        fontSize: 15, // Match the label size
        fontWeight: '600',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB', // Softer divider color
        marginVertical: 12, // More spacing around divider
    },
    billTotalLabel: {
        fontSize: 17, // Larger for total row
        fontWeight: '700',
        color: '#1C1C1E',
        fontFamily: 'System',
    },
    billTotalValue: {
        fontSize: 19, // Larger total amount
        fontWeight: '700',
        color: '#e36057ff',
        fontFamily: 'System',
    },
    proceedContainer: {
        position: 'absolute',
        bottom: 20, // Add some space from bottom
        left: 20,
        right: 20,
        paddingVertical: 10,
        backgroundColor: 'transparent', // Make background transparent for floating effect
    },
    proceedButton: {
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
    proceedButtonContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    proceedButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'System',
    },
    proceedButtonSubtext: {
        color: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'System',
        marginTop: 2,
        opacity: 0.8,
    },
});

export default CartScreen;
